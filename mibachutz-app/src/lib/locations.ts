// Cities and areas for Meebahutz
// Based on meebahutz.com structure

export interface Area {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  areas: Area[];
}

export const cities: City[] = [
  {
    name: 'תל אביב',
    nameEn: 'Tel Aviv',
    lat: 32.0853,
    lng: 34.7818,
    areas: [
      { name: 'גן מאיר', nameEn: 'Gan Meir', lat: 32.0731, lng: 34.7747 },
      { name: 'פלורנטין', nameEn: 'Florentin', lat: 32.0561, lng: 34.7672 },
      { name: 'נווה צדק', nameEn: 'Neve Tzedek', lat: 32.0589, lng: 34.7642 },
      { name: 'הבימה', nameEn: 'Habima', lat: 32.0725, lng: 34.7789 },
      { name: 'רוטשילד', nameEn: 'Rothschild', lat: 32.0636, lng: 34.7747 },
      { name: 'לב העיר', nameEn: 'City Center', lat: 32.0667, lng: 34.7833 },
      { name: 'הצפון הישן', nameEn: 'Old North', lat: 32.0867, lng: 34.7833 },
      { name: 'הצפון החדש', nameEn: 'New North', lat: 32.0950, lng: 34.7850 },
      { name: 'רמת אביב', nameEn: 'Ramat Aviv', lat: 32.1133, lng: 34.8000 },
      { name: 'רמת אביב ג׳', nameEn: 'Ramat Aviv Gimel', lat: 32.1200, lng: 34.8050 },
      { name: 'נווה אביבים', nameEn: 'Neve Avivim', lat: 32.1150, lng: 34.7950 },
      { name: 'יפו', nameEn: 'Jaffa', lat: 32.0503, lng: 34.7519 },
      { name: 'בבלי', nameEn: 'Bavli', lat: 32.0975, lng: 34.7914 },
      { name: 'קרית שאול', nameEn: 'Kiryat Shaul', lat: 32.0900, lng: 34.7700 },
      { name: 'נווה שאנן', nameEn: 'Neve Shaanan', lat: 32.0550, lng: 34.7750 },
      { name: 'שפירא', nameEn: 'Shapira', lat: 32.0520, lng: 34.7700 },
      { name: 'כרם התימנים', nameEn: 'Kerem HaTeimanim', lat: 32.0650, lng: 34.7650 },
      { name: 'לב תל אביב', nameEn: 'Lev Tel Aviv', lat: 32.0700, lng: 34.7750 },
      { name: 'מונטיפיורי', nameEn: 'Montefiore', lat: 32.0620, lng: 34.7680 },
      { name: 'נחלת בנימין', nameEn: 'Nachalat Binyamin', lat: 32.0640, lng: 34.7720 },
    ]
  },
  {
    name: 'ראשון לציון',
    nameEn: 'Rishon LeZion',
    lat: 31.9730,
    lng: 34.7925,
    areas: [
      { name: 'מרכז העיר', nameEn: 'City Center', lat: 31.9640, lng: 34.8040 },
      { name: 'נחלת יהודה', nameEn: 'Nachalat Yehuda', lat: 31.9580, lng: 34.7950 },
      { name: 'רמת אליהו', nameEn: 'Ramat Eliyahu', lat: 31.9700, lng: 34.7850 },
      { name: 'נווה הדרים', nameEn: 'Neve Hadarim', lat: 31.9750, lng: 34.8100 },
      { name: 'קרית משה', nameEn: 'Kiryat Moshe', lat: 31.9680, lng: 34.7920 },
    ]
  },
  {
    name: 'פתח תקווה',
    nameEn: 'Petah Tikva',
    lat: 32.0841,
    lng: 34.8878,
    areas: [
      { name: 'מרכז', nameEn: 'Center', lat: 32.0841, lng: 34.8878 },
      { name: 'כפר גנים', nameEn: 'Kfar Ganim', lat: 32.0750, lng: 34.8950 },
      { name: 'עמישב', nameEn: 'Amishav', lat: 32.0900, lng: 34.8800 },
      { name: 'קרול', nameEn: 'Krol', lat: 32.0780, lng: 34.8700 },
    ]
  },
  {
    name: 'חיפה',
    nameEn: 'Haifa',
    lat: 32.7940,
    lng: 34.9896,
    areas: [
      { name: 'הכרמל', nameEn: 'Carmel', lat: 32.7580, lng: 34.9780 },
      { name: 'אחוזה', nameEn: 'Ahuza', lat: 32.7750, lng: 34.9850 },
      { name: 'דניה', nameEn: 'Danya', lat: 32.7820, lng: 34.9920 },
      { name: 'נווה שאנן', nameEn: 'Neve Shaanan', lat: 32.7700, lng: 34.9750 },
      { name: 'המושבה הגרמנית', nameEn: 'German Colony', lat: 32.8100, lng: 34.9900 },
    ]
  },
  {
    name: 'ירושלים',
    nameEn: 'Jerusalem',
    lat: 31.7683,
    lng: 35.2137,
    areas: [
      { name: 'רחביה', nameEn: 'Rehavia', lat: 31.7700, lng: 35.2100 },
      { name: 'בקעה', nameEn: 'Baka', lat: 31.7550, lng: 35.2200 },
      { name: 'קטמון', nameEn: 'Katamon', lat: 31.7600, lng: 35.2050 },
      { name: 'טלביה', nameEn: 'Talbieh', lat: 31.7680, lng: 35.2180 },
      { name: 'עמק רפאים', nameEn: 'Emek Refaim', lat: 31.7580, lng: 35.2150 },
    ]
  },
  {
    name: 'רמת גן',
    nameEn: 'Ramat Gan',
    lat: 32.0680,
    lng: 34.8240,
    areas: [
      { name: 'מרכז', nameEn: 'Center', lat: 32.0680, lng: 34.8240 },
      { name: 'הבורסה', nameEn: 'Diamond Exchange', lat: 32.0850, lng: 34.8350 },
      { name: 'נחלת גנים', nameEn: 'Nachalat Ganim', lat: 32.0600, lng: 34.8150 },
      { name: 'רמת חן', nameEn: 'Ramat Chen', lat: 32.0750, lng: 34.8100 },
    ]
  },
  {
    name: 'הרצליה',
    nameEn: 'Herzliya',
    lat: 32.1629,
    lng: 34.8447,
    areas: [
      { name: 'הרצליה פיתוח', nameEn: 'Herzliya Pituach', lat: 32.1700, lng: 34.8100 },
      { name: 'מרכז', nameEn: 'Center', lat: 32.1629, lng: 34.8447 },
      { name: 'נווה אמירים', nameEn: 'Neve Amirim', lat: 32.1550, lng: 34.8500 },
      { name: 'גליל ים', nameEn: 'Glil Yam', lat: 32.1750, lng: 34.8000 },
    ]
  },
];

export function getCityByName(name: string): City | undefined {
  return cities.find(c => c.name === name || c.nameEn === name);
}

export function getAreasByCity(cityName: string): Area[] {
  const city = getCityByName(cityName);
  return city?.areas || [];
}
