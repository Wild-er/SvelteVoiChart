<script>
    import { onMount } from 'svelte';
  
    let humbleLPInfo;
    let nomadexLPInfo;
    let priceHistory = [];
  
    async function fetchData() {
      const response = await fetch('https://svelte-voi-chart.vercel.app/api');
      if (response.ok) {
        const data = await response.json();
        humbleLPInfo = data.humbleLPInfo;
        nomadexLPInfo = data.nomadexLPInfo;
        priceHistory = data.priceHistory;
      } else {
        console.error('Failed to fetch data');
      }
    }
  
    onMount(fetchData);
  </script>
  
  <main>
    {#if humbleLPInfo || nomadexLPInfo}
      <h1>Price of VOI</h1>
      {#if humbleLPInfo}
        <h2>Humble LP Information</h2>
        <div>
          <strong>wVOI Balance:</strong> {humbleLPInfo.wVoi / 1e6} <br>
          <strong>VIA Balance:</strong> {humbleLPInfo.Via / 1e6} <br>
          <h3><a href="https://shellyssandbox.xyz/#/swap?poolId=24590736&mode=swap">Swap on Humble</a></h3>
        </div>
      {/if}
      {#if nomadexLPInfo}
        <h2>Nomadex LP Information</h2>
        <div>
          <strong>VOI Balance:</strong> {nomadexLPInfo.Voi / 1e6} <br>
          <strong>VIA Balance:</strong> {nomadexLPInfo.Via / 1e6} <br>
          <h3><a href="https://voi.nomadex.app/swap/VOI-VIA">Swap on Nomadex</a></h3>
        </div>
      {/if}
    {/if}
  
    <h1>Testnet Voi Value in USD</h1>
    <iframe
      title="Vestige Widget"
      src="https://vestige.fi/widget/1392374998/chart?currency=USD&tools=false&adjust=true&interval=60"
      width="500" height="300"
    />
  
    <h1><a href="https://voitest.k8s.aramid.finance/">Aramid Bridge</a> Voi testnet & Algorand mainnet</h1>
  
    {#if !humbleLPInfo && !nomadexLPInfo}
      <p>Loading LP information...</p>
    {/if}
  
    <h2>Price History</h2>
    {#if priceHistory.length > 0}
      <ul>
        {#each priceHistory as entry}
          <li><strong>{entry.dex}:</strong> {new Date(entry.timestamp).toLocaleString()} - <strong>{Number(entry.price).toFixed(4)}</strong></li>
        {/each}
      </ul>
    {:else}
      <p>Loading price history...</p>
    {/if}
  </main>
  
  <style>
    /* Style adjustments if needed */
  </style>
  
