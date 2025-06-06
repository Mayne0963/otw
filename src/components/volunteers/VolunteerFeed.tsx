import Image from 'next/image';
import { Card } from '../ui/card';
import { Clock, Heart } from 'lucide-react';

const volunteerStories = [
  {
    id: 1,
    name: 'Aaliyah',
    image: '/assets/volunteers/aaliyah.jpg',
    story:
      'Just delivered groceries to Mrs. Johnson on the northeast side. Her smile made my whole day! 🥰',
    time: '2 hours ago',
  },
  {
    id: 2,
    name: 'Marcus',
    image: '/assets/volunteers/marcus.jpg',
    story:
      'Helped a family move their furniture today. Love being part of this amazing Fort Wayne community! 💪',
    time: '4 hours ago',
  },
];

export default function VolunteerFeed() {
  return (
    <div className="space-y-6">
      {volunteerStories.map((story) => (
        <Card key={story.id} className="p-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={story.image}
                alt={story.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{story.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {story.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-otw-red" />
                    Volunteer
                  </div>
                </div>
              </div>

              <p className="text-gray-300">{story.story}</p>

              <div className="flex justify-end">
                <button className="text-sm text-otw-gold hover:text-otw-red transition-colors">
                  Read full story →
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="text-center">
        <button className="text-otw-gold hover:text-otw-red transition-colors">
          Load more stories...
        </button>
      </div>
    </div>
  );
}
