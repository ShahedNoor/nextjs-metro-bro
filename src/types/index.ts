export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images?: string[];
  badge?: string;
  available: boolean;
  created_at?: string;
}

export function parseProductImages(product: Partial<Product>): string[] {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter(Boolean);
  }
  const imgStr = product.image;
  if (!imgStr) return [];
  if (imgStr.startsWith('[') && imgStr.endsWith(']')) {
    try {
      const parsed = JSON.parse(imgStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(Boolean);
      }
    } catch {}
  }
  return [imgStr];
}

export interface Order {
  id: string;
  order_ref: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  delivery_charge: number;
  total_price: number;
  customer_name: string;
  phone: string;
  district: string;
  address: string;
  payment_method: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  whatsapp_sent?: boolean;
  created_at: string;
}

export interface StoreSettings {
  brandName: string;
  whatsappNumber: string;
  currency: string;
  notificationEmail: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  recipientNumber: string;
}

export const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Chattogram",
  "Cox's Bazar",
  "Cumilla",
  "Sylhet",
  "Rajshahi",
  "Bogura",
  "Khulna",
  "Jashore",
  "Barishal",
  "Mymensingh",
  "Rangpur",
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Bhola",
  "Brahmanbaria",
  "Chandpur",
  "Chapai Nawabganj",
  "Chuadanga",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gopalganj",
  "Habiganj",
  "Jamalpur",
  "Jhalokathi",
  "Jhenaidah",
  "Joypurhat",
  "Khagrachhari",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Naogaon",
  "Narail",
  "Narsingdi",
  "Natore",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rangamati",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Tangail",
  "Thakurgaon"
] as const;
