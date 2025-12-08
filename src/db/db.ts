import Dexie, { type Table } from 'dexie';

export interface Product {
    id?: number;
    name: string;
    price: number;
    category: string;
    description?: string;
    type: 'paid' | 'complimentary'; // Added type
}

export interface RestaurantTable {
    id?: number;
    name: string;
    section: string;
    status: 'available' | 'occupied';
    currentOrderId?: number;
}

export interface Order {
    id?: number;
    tableId: number;
    status: 'active' | 'paid' | 'no_payment'; // Added no_payment
    totalAmount: number;
    createdAt: Date;
    closedAt?: Date;
}

export interface OrderItem {
    id?: number;
    orderId: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    type: 'paid' | 'complimentary';
    isPaid?: boolean; // Added isPaid
}

export class RestaurantDatabase extends Dexie {
    products!: Table<Product>;
    diningTables!: Table<RestaurantTable>;
    orders!: Table<Order>;
    orderItems!: Table<OrderItem>;

    constructor() {
        super('RestaurantPOS');
        // Bumped version to 5 for schema change
        this.version(5).stores({
            products: '++id, name, category, type',
            diningTables: '++id, name, section, status',
            orders: '++id, tableId, status, createdAt',
            orderItems: '++id, orderId, productId, isPaid'
        });
    }
}

export const db = new RestaurantDatabase();

// Seed data generation
db.on('populate', () => {
    const tables: RestaurantTable[] = [];

    // Helper to create tables
    const createTables = (section: string, count: number, prefix: string) => {
        for (let i = 1; i <= count; i++) {
            tables.push({
                name: `${prefix} ${i}`,
                section: section,
                status: 'available'
            });
        }
    };

    // 1. Alt Kat (20 tables)
    createTables('Alt Kat', 20, 'A');
    // 2. Bahçe (15 tables)
    createTables('Bahçe', 15, 'B');
    // 3. 2. Kat (15 tables)
    createTables('2. Kat', 15, 'K2');
    // 4. Teras (10 tables)
    createTables('Teras', 10, 'T');

    // Products Generation
    const products: Product[] = [];

    const categories = [
        { name: 'Başlangıçlar', basePrice: 120, items: ['Çorba', 'Bruschetta', 'Karides Güveç', 'Paçanga Böreği', 'Haydari', 'Humus', 'Atom', 'Girit Ezme', 'Şakşuka', 'Fava', 'Mantar Dolma', 'Sigara Böreği', 'Kalamar Tava', 'Ahtapot Salatası', 'Patlıcan Ezme', 'Gavurdağı Salata', 'Mevsim Salata', 'Çoban Salata', 'Peynir Tabağı', 'Söğüş Tabağı'] },
        { name: 'Ana Yemekler', basePrice: 350, items: ['Izgara Köfte', 'Kuzu Şiş', 'Dana Antrikot', 'Tavuk Şiş', 'Adana Kebap', 'Urfa Kebap', 'Ali Nazik', 'Hünkar Beğendi', 'Karışık Izgara', 'Beyti Sarma', 'Çökertme Kebabı', 'Sac Kavurma', 'Kuzu Pirzola', 'Dana Bonfile', 'Tavuk Kanat', 'Tavuk Pirzola', 'Levrek Izgara', 'Çupra Izgara', 'Somon Izgara', 'Kiremitte Köfte'] },
        { name: 'İçecekler', basePrice: 40, items: ['Kola', 'Fanta', 'Sprite', 'Ice Tea', 'Şalgam', 'Ayran', 'Su', 'Soda', 'Meyve Suyu', 'Limonata', 'Taze Portakal Suyu', 'Türk Kahvesi', 'Çay', 'Bitki Çayı', 'Espresso', 'Latte', 'Cappuccino', 'Americano', 'Filtre Kahve', 'Sıcak Çikolata'] },
        { name: 'Tatlılar', basePrice: 150, items: ['Künefe', 'Katmer', 'Sütlaç', 'Kazandibi', 'Baklava', 'Şöbiyet', 'Fıstıklı Sarma', 'Trileçe', 'Cheesecake', 'Tiramisu', 'Profiterol', 'Magnolia', 'Dondurma', 'Meyve Tabağı', 'Kabak Tatlısı', 'Ayva Tatlısı', 'İrmik Helvası', 'Revani', 'Şekerpare', 'Kemalpaşa'] },
        { name: 'Alkollü İçecekler', basePrice: 250, items: ['Rakı 35cl', 'Rakı 50cl', 'Rakı 70cl', 'Rakı 100cl', 'Bira 33cl', 'Bira 50cl', 'Şarap Kadeh', 'Şarap Şişe', 'Votka Kadeh', 'Votka Şişe', 'Cin Tonik', 'Viski Kadeh', 'Viski Şişe', 'Tekila Shot', 'Kokteyl 1', 'Kokteyl 2', 'Kokteyl 3', 'Likör', 'Konyak', 'Şampanya'] }
    ];

    categories.forEach(cat => {
        cat.items.forEach((item, index) => {
            products.push({
                name: item,
                category: cat.name,
                price: Math.floor(cat.basePrice + (index * 5) + (Math.random() * 20)), // Integer price
                description: `Lezzetli ${item} sunumu`,
                type: 'paid' // Default to paid
            });
        });
    });

    // Return the promise to ensure Dexie waits for population
    return db.transaction('rw', db.diningTables, db.products, async () => {
        await db.diningTables.bulkAdd(tables);
        await db.products.bulkAdd(products);
    });
});
