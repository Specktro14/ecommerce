
src/
├── modules/
│   ├── auth/
│   │   └── auth.ts
│   │
│   ├── users/
│   │   ├── users.tables.ts
│   │   ├── users.repository.ts
│   │   ├── users.service.ts
│   │   └── users.validation.ts
│   │
│   ├── customers/
│   │   ├── customers.tables.ts
│   │   ├── customers.repository.ts
│   │   ├── customers.service.ts
│   │   └── customers.validation.ts
│   │
│   ├── products/
│   │   ├── products.tables.ts
│   │   ├── products.repository.ts
│   │   ├── products.service.ts
│   │   ├── products.validation.ts
│   │   └── products.types.ts
│   │
│   ├── categories/
│   │   ├── categories.tables.ts
│   │   ├── categories.repository.ts
│   │   ├── categories.service.ts
│   │   └── categories.validation.ts
│   │
│   ├── attributes/
│   │   ├── attributes.tables.ts
│   │   ├── attributes.repository.ts
│   │   ├── attributes.service.ts
│   │   └── attributes.validation.ts
│   │
│   ├── product-options/
│   │   ├── product-options.tables.ts
│   │   ├── product-options.repository.ts
│   │   ├── product-options.service.ts
│   │   └── product-options.validation.ts
│   │
│   ├── inventory/
│   │   ├── inventory.repository.ts
│   │   ├── inventory.service.ts
│   │   ├── inventory.validation.ts
│   │   └── inventory.types.ts
│   │
│   ├── pricing/
│   │   ├── pricing.repository.ts
│   │   ├── pricing.service.ts
│   │   ├── pricing.calculations.ts
│   │   └── pricing.types.ts
│   │
│   ├── orders/
│   │   ├── orders.tables.ts
│   │   ├── orders.repository.ts
│   │   ├── orders.service.ts
│   │   ├── orders.validation.ts
│   │   └── orders.types.ts
│   │
│   └── payments/
│       ├── payments.service.ts
│       ├── payments.validation.ts
│       └── payments.types.ts
│
├── db/
│   ├── schema.ts
│   ├── index.ts
│   └── migrations/
│
├── lib/
│   ├── errors.ts
│   ├── money.ts
│   └── env.ts
│
└── app.ts
