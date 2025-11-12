import type { CateringItem, StationeryItem, Movie } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

export const MOCK_CATERING_ITEMS: CateringItem[] = [
  { id: 'cat1', name: 'Deluxe Burger', category: 'Food', price: 12.5, imageUrl: 'https://picsum.photos/seed/burger/400/250', description: 'A juicy beef patty with fresh vegetables.' },
  { id: 'cat2', name: 'Tropical Smoothie', category: 'Beverages', price: 7.0, imageUrl: 'https://picsum.photos/seed/smoothie/400/250', description: 'A refreshing blend of tropical fruits.' },
  { id: 'cat3', name: 'Spicy Nachos', category: 'Snacks', price: 9.0, imageUrl: 'https://picsum.photos/seed/nachos/400/250', description: 'Crispy nachos with cheese and jalapeños.' },
  { id: 'cat4', name: 'Margherita Pizza', category: 'Food', price: 15.0, imageUrl: 'https://picsum.photos/seed/pizza/400/250', description: 'Classic pizza with tomatoes and mozzarella.' },
  { id: 'cat5', name: 'Iced Coffee', category: 'Beverages', price: 5.5, imageUrl: 'https://picsum.photos/seed/coffee/400/250', description: 'Chilled coffee, perfect for a sunny day.' },
  { id: 'cat6', name: 'Fruit Platter', category: 'Snacks', price: 8.0, imageUrl: 'https://picsum.photos/seed/fruit/400/250', description: 'A selection of fresh seasonal fruits.' },
  { id: 'cat7', name: 'Chicken Caesar Salad', category: 'Food', price: 11.0, imageUrl: 'https://picsum.photos/seed/salad/400/250', description: 'Grilled chicken over crisp romaine lettuce.' },
  { id: 'cat8', name: 'Fresh Orange Juice', category: 'Beverages', price: 6.0, imageUrl: 'https://picsum.photos/seed/juice/400/250', description: 'Freshly squeezed orange juice.' },
  { id: 'cat9', name: 'Chocolate Chip Cookies', category: 'Snacks', price: 4.5, imageUrl: 'https://picsum.photos/seed/cookies/400/250', description: 'A pack of three warm, gooey cookies.' },
];

export const MOCK_STATIONERY_ITEMS: StationeryItem[] = [
  { id: 'sta1', name: 'Cruise Ship Model', category: 'Gift Items', price: 25.0, imageUrl: 'https://picsum.photos/seed/ship-model/400/250', description: 'A detailed model of our flagship vessel.' },
  { id: 'sta2', name: 'Artisanal Chocolates', category: 'Chocolates', price: 15.0, imageUrl: 'https://picsum.photos/seed/chocolates/400/250', description: 'A box of handcrafted luxury chocolates.' },
  { id: 'sta3', name: 'The Ocean\'s Whisper', category: 'Tale Books', price: 18.0, imageUrl: 'https://picsum.photos/seed/mystery-book/400/250', description: 'A thrilling mystery novel set at sea.' },
  { id: 'sta4', name: 'Anchor Keychain', category: 'Gift Items', price: 7.5, imageUrl: 'https://picsum.photos/seed/keychain/400/250', description: 'A stylish anchor-shaped metal keychain.' },
  { id: 'sta5', name: 'Sea Salt Caramels', category: 'Chocolates', price: 12.0, imageUrl: 'https://picsum.photos/seed/caramels/400/250', description: 'Sweet and savory sea salt caramels.' },
  { id: 'sta6', name: 'Captain\'s Log', category: 'Tale Books', price: 22.0, imageUrl: 'https://picsum.photos/seed/journal/400/250', description: 'A beautiful journal to document your travels.' },
  { id: 'sta7', name: 'Branded T-Shirt', category: 'Gift Items', price: 30.0, imageUrl: 'https://picsum.photos/seed/tshirt/400/250', description: 'A high-quality cotton t-shirt with the cruise logo.' },
  { id: 'sta8', name: 'Truffle Selection', category: 'Chocolates', price: 20.0, imageUrl: 'https://picsum.photos/seed/truffles/400/250', description: 'An assortment of decadent chocolate truffles.' },
  { id: 'sta9', name: 'Pirate Stories for Kids', category: 'Tale Books', price: 12.0, imageUrl: 'https://picsum.photos/seed/kids-book/400/250', description: 'A collection of fun pirate adventure stories.' },
];
