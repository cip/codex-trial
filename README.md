# EPEX Spot Preis Dashboard für Österreich

Eine kleine Flask-Webanwendung, die die aktuellen österreichischen EPEX Spot Day-Ahead Preise über die [aWATTar API](https://www.awattar.de/services/api) lädt und interaktiv in einem Chart.js Diagramm darstellt.

## Voraussetzungen

- Python 3.12 (oder kompatibel)
- Ein virtuelles Python-Umfeld wird empfohlen

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Entwicklung starten

```bash
flask --app app run --debug
```

Die Anwendung steht anschließend unter <http://127.0.0.1:5000> zur Verfügung.

## Tests

Aktuell gibt es keine automatisierten Tests. Die wichtigsten Funktionstests erfolgen manuell durch Aufruf der Weboberfläche und Prüfung der ausgegebenen Daten.
