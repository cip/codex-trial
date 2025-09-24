async function loadPrices() {
  const statusEl = document.getElementById('status');
  try {
    statusEl.textContent = 'Lade Preisdaten...';
    const response = await fetch('/api/prices');
    if (!response.ok) {
      throw new Error(`Fehler beim Laden: ${response.status}`);
    }

    const payload = await response.json();
    const prices = payload.prices || [];
    if (!prices.length) {
      statusEl.textContent = 'Keine Preisdaten verfügbar.';
      return;
    }

    const unit = prices[0].unit || 'EUR/MWh';
    const labels = prices.map((entry) => new Date(entry.time).toLocaleString('de-AT', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }));

    const data = prices.map((entry) => entry.price);

    const ctx = document.getElementById('priceChart');
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 134, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 134, 255, 0.05)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Preis (${unit})`,
          data,
          fill: true,
          backgroundColor: gradient,
          borderColor: 'rgba(0, 134, 255, 1)',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              autoSkip: true
            }
          },
          y: {
            title: {
              display: true,
              text: unit
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const priceValue = context.parsed.y;
                return ` ${priceValue.toFixed(2)} ${unit}`;
              }
            }
          }
        }
      }
    });

    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    statusEl.textContent = `Zeitraum: ${labels[0]} – ${labels[labels.length - 1]} | Min: ${minPrice.toFixed(2)} ${unit} | Max: ${maxPrice.toFixed(2)} ${unit}`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Es ist ein Fehler beim Laden der Daten aufgetreten.';
  }
}

document.addEventListener('DOMContentLoaded', loadPrices);
