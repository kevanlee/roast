import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <main>
    <h1>Roast</h1>
    <p>Time to build something awesome.</p>
    <button id="cta">Launch</button>
  </main>
`;

document.querySelector('#cta').addEventListener('click', () => {
  alert('🚀 Roast is on the launchpad!');
});
