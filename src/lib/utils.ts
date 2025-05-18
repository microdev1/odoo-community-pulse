import { z } from 'zod';
import { format } from 'date-fns';

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  location: z.string().optional(),
});

// Event validation schema
export const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum([
    'GARAGE_SALE',
    'SPORTS',
    'MATCH',
    'COMMUNITY_CLASS',
    'VOLUNTEER',
    'EXHIBITION',
    'FESTIVAL'
  ]),
  location: z.string().min(3, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startDate: z.date().refine(date => date > new Date(), 'Start date must be in the future'),
  endDate: z.date().refine(date => date > new Date(), 'End date must be in the future'),
  imageUrl: z.string().optional(),
});

// Attendance validation schema
export const attendanceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  peopleCount: z.number().int().positive().max(50, 'Maximum 50 people allowed'),
});

// Format date for display
export const formatDate = (date: Date) => {
  return format(date, 'PPP');
};

// Format time for display
export const formatTime = (date: Date) => {
  return format(date, 'p');
};

// Format date and time
export const formatDateTime = (date: Date) => {
  return format(date, 'PPp');
};

// Map category values to display labels
export const categoryLabels = {
  GARAGE_SALE: 'Garage Sale',
  SPORTS: 'Sports',
  MATCH: 'Match',
  COMMUNITY_CLASS: 'Community Class',
  VOLUNTEER: 'Volunteer Opportunity',
  EXHIBITION: 'Exhibition',
  FESTIVAL: 'Festival or Celebration',
};

// Get category label
export const getCategoryLabel = (category: string) => {
  return categoryLabels[category as keyof typeof categoryLabels] || category;
};
