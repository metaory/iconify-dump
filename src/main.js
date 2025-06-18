import './style.css'

const app = document.querySelector('#app')
const base = import.meta.env.BASE_URL

async function renderCollections() {
  const collections = await fetch(`${base}collections/collections.json`).then(r => r.json())
  const collectionsGrid = Object.entries(collections)
    .map(([key, collection]) => `
      <a href="${base}collection/${key}" class="collection-card">
        <h3>${collection.name}</h3>
        <span class="count">${collection.total}</span>
      </a>
    `)
    .join('')

  app.innerHTML = `
    <div class="collections-grid">
      ${collectionsGrid}
    </div>
  `
}

async function handleRoute() {
  const path = window.location.pathname.replace(base, '/')
  if (path.startsWith('/collection/')) {
    const mod = await import('./collection.js')
    await mod.renderCollectionPage()
  } else {
    await renderCollections()
  }
}

async function transitionRoute() {
  if (document.startViewTransition) {
    document.startViewTransition(() => handleRoute())
  } else {
    handleRoute()
  }
}

transitionRoute()

window.addEventListener('popstate', transitionRoute)

app.addEventListener('click', e => {
  const a = e.target.closest('a.collection-card, a.back-link')
  if (a?.href) {
    e.preventDefault()
    history.pushState({}, '', a.getAttribute('href'))
    transitionRoute()
  }
})