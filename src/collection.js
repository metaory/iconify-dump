import './style.css'

const app = document.querySelector('#app')
const base = import.meta.env.BASE_URL

const collectionCache = {}
const iconCache = {}

const filter = new Proxy({ value: '' }, {
  set(obj, prop, val) {
    obj[prop] = val
    renderIcons()
    return true
  }
})
let icons = []
let collection
let debounceTimer

function renderIcon({ body, width = 24, height = 24 }) {
  return `<svg viewBox="0 0 ${width} ${height}" class="icon-svg">${body}</svg>`
}

async function iconView(id, opts = {}) {
  const [col, name] = id.split('--')
  try {
    if (!iconCache[col]) {
      const res = await fetch(`${base}collections/json/${col}.json`)
      const data = await res.json()
      iconCache[col] = data.icons || data
    }
    const icon = iconCache[col][name]
    if (!icon) return ''
    const w = icon.width || 24
    const h = icon.height || 24
    const body = icon.body.startsWith('<') ? icon.body : `<path d="${icon.body}" fill="currentColor"/>`
    return `<svg viewBox="0 0 ${w} ${h}" class="icon-svg" ${opts.class ? `class='${opts.class}'` : ''}>${body}</svg>`
  } catch (e) {
    return ''
  }
}

function toast(msg) {
  const t = document.createElement('div')
  t.className = 'toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 1200)
}

function renderIcons() {
  const q = filter.value.trim().toLowerCase()
  const filtered = q ? icons.filter(([n]) => n.toLowerCase().includes(q)) : icons
  document.querySelector('.icons-grid').innerHTML = filtered.map(([name, icon]) => {
    const id = `${collection.prefix}--${name}`
    const w = icon.width || 24
    const h = icon.height || 24
    const body = icon.body.startsWith('<') ? icon.body : `<path d="${icon.body}" fill="currentColor"/>`
    return `
      <div class="icon-card" data-id="${id}">
        <div class="icon-preview" data-id="${id}">
          <svg viewBox=\"0 0 ${w} ${h}\" class=\"icon-svg\">${body}</svg>
        </div>
        <span class="icon-name">${name}</span>
      </div>
    `
  }).join('')
  const cards = document.querySelectorAll('.icon-card')
  for (const card of cards) {
    card.onclick = e => {
      const id = card.dataset.id
      const [col, name] = id.split('--')
      const copyText = `${col}_${name}`
      navigator.clipboard.writeText(copyText)
      toast(`Copied: ${copyText}`)
    }
  }
}

export async function renderCollectionPage() {
  const path = window.location.pathname.replace(base, '/')
  const collectionId = path.split('/').pop()
  const url = `${base}collections/json/${collectionId}.json`

  if (collectionCache[collectionId]) {
    collection = collectionCache[collectionId]
  } else {
    collection = await fetch(url).then(r => {
      if (!r.ok) throw new Error('Collection not found')
      return r.json()
    })
    collectionCache[collectionId] = collection
  }

  icons = Object.entries(collection.icons)

  app.innerHTML = `
    <input class="icon-filter" type="text" placeholder="Filter icons..." value="${filter.value}">
    <a href="${base}" class="back-link" id="back-link"></a>
    <div class="collection-header">
      <h1>${collection.info?.name || collectionId}</h1>
    </div>
    <div class="icons-grid"></div>
  `
  iconView('uil--angle-left', {width:96, height:96}).then(svg => {
    document.getElementById('back-link').innerHTML = svg
  })
  renderIcons()
  const input = document.querySelector('.icon-filter')
  input.oninput = e => {
    clearTimeout(debounceTimer)
    const v = e.target.value
    debounceTimer = setTimeout(() => { filter.value = v }, 200)
  }
}