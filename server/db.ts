import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export type BinStatus = 'Normal' | 'Filling' | 'Collection Required' | 'Overflow Risk';

export interface Bin {
  id: string;
  bin_name: string;
  location: string;
  coord_x: number;
  coord_y: number;
  fill_percentage: number;
  status: BinStatus;
  last_updated: string;
}

export interface CollectionLog {
  id: string;
  bin_id: string;
  bin_name: string;
  location: string;
  collected_at: string;
  previous_fill_level: number;
}

export function calculateStatus(fill: number): BinStatus {
  if (fill >= 100) return 'Overflow Risk';
  if (fill >= 80) return 'Collection Required';
  if (fill >= 50) return 'Filling';
  return 'Normal';
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smart_waste_db.json');

interface DatabaseState {
  users: User[];
  bins: Bin[];
  collection_logs: CollectionLog[];
}

function getInitialBins(): Bin[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'b1111111-1111-4111-8111-111111111111',
      bin_name: 'Bin #101 - Library Plaza',
      location: 'Central Library Main Entry',
      coord_x: 20,
      coord_y: 35,
      fill_percentage: 85,
      status: 'Collection Required',
      last_updated: now,
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      bin_name: 'Bin #102 - Student Canteen',
      location: 'Dining Hall Outdoor Patio',
      coord_x: 45,
      coord_y: 30,
      fill_percentage: 100,
      status: 'Overflow Risk',
      last_updated: now,
    },
    {
      id: 'b3333333-3333-4333-8333-333333333333',
      bin_name: 'Bin #103 - Engineering Block A',
      location: 'Robotics & Hardware Lab West',
      coord_x: 70,
      coord_y: 75,
      fill_percentage: 60,
      status: 'Filling',
      last_updated: now,
    },
    {
      id: 'b4444444-4444-4444-8444-444444444444',
      bin_name: 'Bin #104 - Science Complex',
      location: 'Chemistry Quad Walkway',
      coord_x: 85,
      coord_y: 45,
      fill_percentage: 92,
      status: 'Collection Required',
      last_updated: now,
    },
    {
      id: 'b5555555-5555-4555-8555-555555555555',
      bin_name: 'Bin #105 - Sports Arena',
      location: 'Gymnasium & Track Side',
      coord_x: 30,
      coord_y: 85,
      fill_percentage: 35,
      status: 'Normal',
      last_updated: now,
    },
    {
      id: 'b6666666-6666-4666-8666-666666666666',
      bin_name: 'Bin #106 - Hostel Block 1',
      location: 'North Dormitory Courtyard',
      coord_x: 15,
      coord_y: 70,
      fill_percentage: 100,
      status: 'Overflow Risk',
      last_updated: now,
    },
    {
      id: 'b7777777-7777-4777-8777-777777777777',
      bin_name: 'Bin #107 - Hostel Block 2',
      location: 'South Dormitory Common Lawn',
      coord_x: 25,
      coord_y: 80,
      fill_percentage: 82,
      status: 'Collection Required',
      last_updated: now,
    },
    {
      id: 'b8888888-8888-4888-8888-888888888888',
      bin_name: 'Bin #108 - Admin Main Hall',
      location: 'President Office Rotunda',
      coord_x: 50,
      coord_y: 15,
      fill_percentage: 25,
      status: 'Normal',
      last_updated: now,
    },
    {
      id: 'b9999999-9999-4999-8999-999999999999',
      bin_name: 'Bin #109 - Tech Innovation Hub',
      location: 'Incubator & Cafe Alley',
      coord_x: 90,
      coord_y: 70,
      fill_percentage: 88,
      status: 'Collection Required',
      last_updated: now,
    },
    {
      id: 'baaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      bin_name: 'Bin #110 - Health & Wellness',
      location: 'Campus Clinic North Gate',
      coord_x: 75,
      coord_y: 20,
      fill_percentage: 45,
      status: 'Normal',
      last_updated: now,
    },
  ];
}

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.bins && parsed.users) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db file, initializing fresh store.', e);
    }

    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    const initialState: DatabaseState = {
      users: [
        {
          id: 'u1111111-1111-4111-8111-111111111111',
          name: 'Sarah Connor',
          email: 'manager@campus.edu',
          password_hash: defaultPasswordHash,
          role: 'manager',
          created_at: new Date().toISOString(),
        },
      ],
      bins: getInitialBins(),
      collection_logs: [
        {
          id: 'l1111111-1111-4111-8111-111111111111',
          bin_id: 'b2222222-2222-4222-8222-222222222222',
          bin_name: 'Bin #102 - Student Canteen',
          location: 'Dining Hall Outdoor Patio',
          collected_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          previous_fill_level: 95,
        },
        {
          id: 'l2222222-2222-4222-8222-222222222222',
          bin_id: 'b1111111-1111-4111-8111-111111111111',
          bin_name: 'Bin #101 - Library Plaza',
          location: 'Central Library Main Entry',
          collected_at: new Date(Date.now() - 3600000 * 6).toISOString(),
          previous_fill_level: 88,
        },
      ],
    };

    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public createUser(name: string, email: string, passwordHash: string, role = 'manager'): User {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      created_at: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.saveState(this.state);
    return newUser;
  }

  public getAllBins(): Bin[] {
    return this.state.bins;
  }

  public getBinById(id: string): Bin | undefined {
    return this.state.bins.find((b) => b.id === id);
  }

  public createBin(name: string, location: string, coord_x: number, coord_y: number): Bin {
    const newBin: Bin = {
      id: crypto.randomUUID(),
      bin_name: name,
      location,
      coord_x,
      coord_y,
      fill_percentage: Math.floor(Math.random() * 20),
      status: 'Normal',
      last_updated: new Date().toISOString(),
    };
    newBin.status = calculateStatus(newBin.fill_percentage);
    this.state.bins.push(newBin);
    this.saveState(this.state);
    return newBin;
  }

  public simulateSensors(): { updatedBins: Bin[]; totalSimulated: number } {
    const now = new Date().toISOString();
    this.state.bins = this.state.bins.map((bin) => {
      // Add random values (5% to 30%) to current bin levels, capped at 100%
      const increment = Math.floor(Math.random() * 26) + 5; // 5 to 30
      const newFill = Math.min(100, bin.fill_percentage + increment);
      return {
        ...bin,
        fill_percentage: newFill,
        status: calculateStatus(newFill),
        last_updated: now,
      };
    });

    this.saveState(this.state);
    return {
      updatedBins: this.state.bins,
      totalSimulated: this.state.bins.length,
    };
  }

  public collectBins(binIds: string[]): { collectedCount: number; logs: CollectionLog[] } {
    const now = new Date().toISOString();
    const newLogs: CollectionLog[] = [];

    this.state.bins = this.state.bins.map((bin) => {
      if (binIds.includes(bin.id)) {
        if (bin.fill_percentage > 0) {
          const log: CollectionLog = {
            id: crypto.randomUUID(),
            bin_id: bin.id,
            bin_name: bin.bin_name,
            location: bin.location,
            collected_at: now,
            previous_fill_level: bin.fill_percentage,
          };
          newLogs.push(log);
          this.state.collection_logs.unshift(log);
        }
        return {
          ...bin,
          fill_percentage: 0,
          status: 'Normal',
          last_updated: now,
        };
      }
      return bin;
    });

    // Keep up to 200 logs
    if (this.state.collection_logs.length > 200) {
      this.state.collection_logs = this.state.collection_logs.slice(0, 200);
    }

    this.saveState(this.state);
    return {
      collectedCount: newLogs.length,
      logs: newLogs,
    };
  }

  public getCollectionLogs(limit = 50): CollectionLog[] {
    return this.state.collection_logs.slice(0, limit);
  }

  public resetAllToDemo() {
    this.state.bins = getInitialBins();
    this.saveState(this.state);
    return this.state.bins;
  }
}

export const db = new DatabaseManager();
