import type { ExtractedData } from './types';

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomConfidence(): number {
  return Math.random() < 0.8 
    ? randomNumber(80, 98) / 100 
    : randomNumber(65, 75) / 100;
}

const firstNames = ['Max', 'Anna', 'Thomas', 'Julia', 'Michael', 'Sarah', 'Lukas', 'Emma', 'Felix', 'Laura'];
const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'];
const streets = ['Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Schulstraße', 'Gartenstraße', 'Bergstraße', 'Waldstraße', 'Lindenstraße'];
const cities = ['München', 'Berlin', 'Hamburg', 'Frankfurt', 'Köln', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'];
const rentIncreaseTypes = ['Staffelmiete', 'Indexmiete', 'Festmiete', 'Wertsicherungsklausel'];
const landlords = ['Hausverwaltung GmbH', 'Immobilien AG', 'Wohnbau Gesellschaft', 'Private Vermietung'];

export function extractLeaseData(filename: string): ExtractedData {
  const coldRent = randomNumber(500, 2000);
  const warmRent = coldRent + randomNumber(100, 400);
  const year = randomNumber(2019, 2024);
  const month = String(randomNumber(1, 12)).padStart(2, '0');
  const day = String(randomNumber(1, 28)).padStart(2, '0');

  const data: ExtractedData = {
    name: randomItem(firstNames),
    surname: randomItem(lastNames),
    address_street: randomItem(streets),
    address_house_number: randomNumber(1, 150).toString(),
    address_zip_code: (10000 + randomNumber(0, 89999)).toString(),
    address_city: randomItem(cities),
    warm_rent: warmRent,
    cold_rent: coldRent,
    rent_increase_type: randomItem(rentIncreaseTypes),
    date: `${year}-${month}-${day}`,
    is_active: Math.random() > 0.2,
    confidence: {
      name: randomConfidence(),
      surname: randomConfidence(),
      address_street: randomConfidence(),
      address_house_number: randomConfidence(),
      address_zip_code: randomConfidence(),
      address_city: randomConfidence(),
      warm_rent: randomConfidence(),
      cold_rent: randomConfidence(),
      rent_increase_type: randomConfidence(),
      date: randomConfidence(),
      is_active: randomConfidence(),
    },
  };

  if (Math.random() > 0.3) {
    data.deposit = coldRent * randomNumber(2, 4);
    data.confidence!.deposit = randomConfidence();
  }
  
  if (Math.random() > 0.3) {
    data.contract_term_months = randomNumber(12, 36);
    data.confidence!.contract_term_months = randomConfidence();
  }
  
  if (Math.random() > 0.3) {
    data.notice_period_months = randomNumber(1, 6);
    data.confidence!.notice_period_months = randomConfidence();
  }
  
  if (Math.random() > 0.3) {
    data.landlord_entity = randomItem(landlords);
    data.confidence!.landlord_entity = randomConfidence();
  }

  return data;
}

export function calculateQualityScore(data: ExtractedData): number {
  return randomNumber(70, 95);
}
