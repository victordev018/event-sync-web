export interface User {
    id: string;
    name: string;
    email: string;
    role: 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN' | 'USER'; // Accommodate both old and new roles during transition
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number;
    attendeesCount: number;
    organizerId: string;
}

export interface AuthResponse {
    token: string;
}
