import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/FormComponents";
import { CalendarIcon, GlobeIcon, PersonIcon } from "@radix-ui/react-icons";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Connect with your local community
              </h1>
              <p className="text-xl mb-6">
                Discover and participate in local events, volunteer opportunities, and community activities in your area.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/events">
                  <Button className="text-lg py-3 px-6">
                    Find Events
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="text-lg py-3 px-6 bg-white">
                    Join Community
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/community-event.jpg"
                  alt="Community Event"
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How Community Pulse Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Events</h3>
              <p className="text-gray-600">
                Browse local events happening in your community, from garage sales to sports matches and volunteer opportunities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <PersonIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mark Your Interest</h3>
              <p className="text-gray-600">
                Easily sign up to attend events with just a few clicks. No lengthy forms or complicated processes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <GlobeIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-600">
                Receive timely reminders and updates about events you're interested in via email or SMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Explore Event Categories</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Community Pulse hosts a wide variety of local events to help you connect with others and make the most of your community.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Garage Sales', icon: '🏠', link: '/events?category=GARAGE_SALE' },
              { name: 'Sports Events', icon: '🏆', link: '/events?category=SPORTS' },
              { name: 'Local Matches', icon: '⚽', link: '/events?category=MATCH' },
              { name: 'Community Classes', icon: '🧘', link: '/events?category=COMMUNITY_CLASS' },
              { name: 'Volunteer Work', icon: '🤝', link: '/events?category=VOLUNTEER' },
              { name: 'Exhibitions', icon: '🎨', link: '/events?category=EXHIBITION' },
              { name: 'Local Festivals', icon: '🎉', link: '/events?category=FESTIVAL' },
            ].map((category, index) => (
              <Link
                key={index}
                href={category.link}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to engage with your community?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Sign up today to discover local events or create your own to bring people together.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button className="text-lg py-3 px-6">
                Create Account
              </Button>
            </Link>
            <Link href="/events/create">
              <Button variant="outline" className="text-lg py-3 px-6 bg-white">
                Host an Event
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

}
