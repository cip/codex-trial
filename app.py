"""Flask web application to display Austrian EPEX spot prices."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List
from zoneinfo import ZoneInfo

import requests
from flask import Flask, jsonify, render_template


APP_TZ = ZoneInfo("Europe/Vienna")
AWATTAR_API_URL = "https://api.awattar.at/v1/marketdata"

def _get_today_range() -> tuple[datetime, datetime]:
    """Return the start and end timestamps for the current day in Vienna time."""
    now = datetime.now(APP_TZ)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=APP_TZ)
    end = start + timedelta(days=1)
    return start, end

def _epoch_ms(dt: datetime) -> int:
    return int(dt.timestamp() * 1000)

def fetch_epex_prices(start: datetime | None = None, end: datetime | None = None) -> List[Dict[str, Any]]:
    """Fetch Austrian EPEX spot prices from the aWATTar market data API."""
    start_dt, end_dt = start, end
    if start_dt is None or end_dt is None:
        start_dt, end_dt = _get_today_range()

    params = {"start": _epoch_ms(start_dt), "end": _epoch_ms(end_dt)}
    response = requests.get(AWATTAR_API_URL, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    prices: List[Dict[str, Any]] = []
    for entry in payload.get("data", []):
        start_ts = entry.get("start_timestamp")
        market_price = entry.get("marketprice")
        unit = entry.get("unit")
        if start_ts is None or market_price is None:
            continue

        start_time = datetime.fromtimestamp(start_ts / 1000, APP_TZ)

        prices.append(
            {
                "time": start_time.isoformat(),
                "price": market_price,
                "unit": unit or "EUR/MWh",
            }
        )

    return prices


def create_app() -> Flask:
    app = Flask(__name__)

    @app.route("/")
    def index() -> str:
        return render_template("index.html")

    @app.route("/api/prices")
    def api_prices() -> Any:
        try:
            prices = fetch_epex_prices()
            return jsonify({"prices": prices})
        except requests.RequestException as exc:  # pragma: no cover - network error path
            return jsonify({"error": str(exc)}), 502

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
