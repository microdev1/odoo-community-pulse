'use client';

import { Card, CardContent, CardFooter, Button } from '@/components/ui/FormComponents';
import { formatDate, formatTime, getCategoryLabel } from '@/lib/utils';
import { CalendarIcon, GlobeIcon, PersonIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';

type EventCardProps = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  organizerName: string;
  isVerifiedOrganizer: boolean;
  attendeesCount: number;
};

export default function EventCard({
  id,
  title,
  description,
  category,
  location,
  startDate,
  endDate,
  imageUrl,
  organizerName,
  isVerifiedOrganizer,
  attendeesCount,
}: EventCardProps) {
  // Format the dates
  const startDateFormatted = formatDate(new Date(startDate));
  const startTimeFormatted = formatTime(new Date(startDate));
  const endTimeFormatted = formatTime(new Date(endDate));

  // Truncate description for preview
  const truncatedDescription =
    description.length > 120 ? description.substring(0, 120) + '...' : description;

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-48 w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <CalendarIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs uppercase font-bold px-2 py-1 rounded">
          {getCategoryLabel(category)}
        </div>
      </div>

      <CardContent className="flex-grow">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>

        <div className="flex items-start space-x-2 text-sm text-gray-500 mb-2">
          <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            {startDateFormatted} · {startTimeFormatted} - {endTimeFormatted}
          </span>
        </div>

        <div className="flex items-start space-x-2 text-sm text-gray-500 mb-3">
          <GlobeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{location}</span>
        </div>

        <div className="flex items-start space-x-2 text-sm text-gray-500 mb-3">
          <PersonIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            By {organizerName}
            {isVerifiedOrganizer && (
              <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                Verified
              </span>
            )}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">{truncatedDescription}</p>

        <div className="text-xs text-gray-500">
          {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'} attending
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Link href={`/events/${id}`} className="w-full">
          <Button className="w-full" variant="primary">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
