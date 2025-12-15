export interface User {
    id?: string;
    name: string;
    email: string;
    role: 'PARTICIPANT' | 'ORGANIZER';
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number;
    attendeesCount: number;
    // Optional: Add organizerId if available from API to check ownership
    organizerId?: string;
}

export interface AuthResponse {
    token: string;
}
