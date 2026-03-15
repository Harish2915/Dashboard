# Halleyx Dashboard

A full-stack analytics dashboard built with **React + FastAPI + MySQL**. Add widgets, drag them anywhere, resize them, configure their appearance, and save your layout — all persisted across sessions.

---

## Screenshots

> Dashboard view with KPI cards, charts, and data table  
> Configure view with drag-and-drop widget placement

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Redux Toolkit, React Grid Layout, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic v2, PyMySQL |
| Database | MySQL 8 |
| Styling | Custom CSS with CSS variables |

---

## Features

- **Drag & drop dashboard** — place widgets anywhere on a 12-column grid
- **Resizable widgets** — drag from corners to resize
- **7 widget types** — KPI cards, Bar, Line, Pie, Area, Scatter charts, Data Table
- **Per-widget settings** — color, format, visibility toggles, column selection
- **Date filter** — filter all charts by Today / 7d / 30d / 90d / All time
- **Orders CRUD** — create, edit, delete customer orders with search and status filters
- **Session persistence** — state survives navigation; resets on refresh or new entry
- **Responsive** — adapts to xl / lg / md / sm breakpoints

---

## Project Structure

```
halleyx-dashboard/
├── frontend/                     # React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── store/
│       │   ├── store.js           # Redux store + sessionStorage persistence
│       │   └── dashboardSlice.js  # All reducers (widgets, layout, orders)
│       ├── services/
│       │   └── api.js             # All fetch calls to FastAPI
│       ├── utils/
│       │   └── dateFilters.js     # Date filter config + formatters
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx / .css
│       │   │   └── TopNavbar.jsx / .css
│       │   ├── dashboard/
│       │   │   ├── DashboardGrid.jsx / .css   # React Grid Layout wrapper
│       │   │   └── WidgetSettingsPanel.jsx / .css
│       │   └── widgets/
│       │       ├── KPIWidget.jsx
│       │       ├── BarChartWidget.jsx
│       │       ├── LineChartWidget.jsx
│       │       ├── PieChartWidget.jsx
│       │       ├── AreaChartWidget.jsx
│       │       ├── ScatterPlotWidget.jsx
│       │       └── TableWidget.jsx / .css
│       └── pages/
│           ├── Dashboard.jsx / .css
│           ├── ConfigurePage.jsx / .css
│           └── CustomerOrders.jsx / .css
│
└── backend/                      # FastAPI + MySQL
    ├── main.py                   # App entry point, CORS, table creation
    ├── database.py               # SQLAlchemy engine
    ├── config.py                 # Settings from .env
    ├── .env                      # Database credentials (see below)
    ├── requirements.txt
    ├── setup.sql                 # DB + tables + 100 seed orders
    ├── models/
    │   ├── order_model.py
    │   └── dashboard_model.py
    ├── schemas/
    │   ├── order_schema.py
    │   └── widget_schema.py
    ├── routes/
    │   ├── order_routes.py
    │   └── dashboard_routes.py
    ├── services/
    │   ├── order_service.py
    │   └── widget_service.py
    └── utils/
        └── filters.py            # Date range helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8+

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/halleyx-dashboard.git
cd halleyx-dashboard
```

---

### 2. Database setup

```bash
mysql -u root -p < backend/setup.sql
```

This creates the `halleyx` database, both tables, and inserts 100 seed orders.

---

### 3. Backend setup

```bash
cd backend
```

Create a `.env` file:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/halleyx
APP_NAME=Halleyx Dashboard API
DEBUG=True
```

Install dependencies and start:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

---

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

---

## Database Tables

### `orders`
Stores all customer orders. Drives every chart and KPI widget.

| Column | Type | Description |
|---|---|---|
| id | VARCHAR(50) PK | Order ID e.g. `ORD-17234956` |
| first_name | VARCHAR(100) | Customer first name |
| last_name | VARCHAR(100) | Customer last name |
| email | VARCHAR(255) | Indexed for fast lookup |
| phone | VARCHAR(30) | |
| street / city / state / postal_code / country | VARCHAR | Shipping address |
| product | VARCHAR(255) | Product name |
| quantity | INT | |
| unit_price | FLOAT | |
| total_amount | FLOAT | `quantity × unit_price` |
| status | VARCHAR(50) | Pending / Processing / Shipped / Delivered / Cancelled |
| created_by | VARCHAR(100) | Staff member who created the order |
| created_at | DATETIME | Auto timestamp |
| updated_at | DATETIME | Auto timestamp on update |

### `dashboard_layouts`
Stores the saved widget configuration. One row per named layout (default: `"default"`).

| Column | Type | Description |
|---|---|---|
| id | INT PK | Auto increment |
| name | VARCHAR(100) UNIQUE | Layout name |
| widgets | JSON | Array of widget objects with position and config |
| created_at | DATETIME | |
| updated_at | DATETIME | |

---

## API Endpoints

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/kpis` | Revenue, orders, customers, AOV KPIs |
| GET | `/api/dashboard/sales` | Monthly revenue for bar chart |
| GET | `/api/dashboard/trend` | Revenue + forecast for line chart |
| GET | `/api/dashboard/categories` | Revenue by product for pie chart |
| GET | `/api/dashboard/traffic` | New vs returning customers for area chart |
| GET | `/api/dashboard/scatter` | Quantity vs revenue for scatter plot |
| GET | `/api/dashboard/layout` | Load saved widget layout |
| POST | `/api/dashboard/layout` | Save widget layout |

All chart endpoints accept `?date_filter=` query param: `today` / `7d` / `30d` / `90d` / `all`

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Paginated orders list with filters |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/{id}` | Update order |
| DELETE | `/api/orders/{id}` | Delete order |
| GET | `/api/orders/stats/summary` | KPI summary stats |

---

## Widget Types & Settings

| Widget | Configurable Settings |
|---|---|
| **KPI Card** | Format (currency/number), decimal places, accent color, card background, show/hide change badge and trend icon |
| **Bar Chart** | Primary metric, bar color, target bar color, corner radius, show/hide target/labels/grid/legend |
| **Line Chart** | Line color, forecast color, line thickness, show/hide forecast/dots/labels/grid |
| **Pie Chart** | Style (donut/pie), color palette, max slices, show/hide legend/labels/percentage |
| **Area Chart** | Colors for both series, fill style (gradient/solid/none), show/hide both series/labels/grid/legend |
| **Scatter Plot** | Dot color, opacity, size, show/hide grid/axis labels |
| **Data Table** | Visible columns, sort by, sort order, rows per page, header background, striped rows |

---

## Session Behaviour

State is persisted using **sessionStorage**:

- **Refresh / new tab / new entry** → state resets, empty dashboard shown
- **Navigate within the app** → state preserved (widgets, layout, date filter)

This means every fresh visit starts clean. Widgets must be added and saved each session via the Configure page.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `mysql+pymysql://root:password@localhost:3306/halleyx` | MySQL connection string |
| `APP_NAME` | `Halleyx Dashboard API` | API title shown in Swagger |
| `DEBUG` | `True` | Enable debug mode |

---

## Running in Production

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or any static host
```

### Backend

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Update CORS origins in `config.py` to match your production domain.

---

## License

MIT