export type ThreadIconName = 'smart-toy' | 'forum';

export type ThreadListEntry = {
  id: string;
  title: string;
  timeLabel: string;
  preview: string;
  icon: ThreadIconName;
  iconVariant: 'accent' | 'muted';
  previewEmphasis: 'strong' | 'subtle';
  timeEmphasis: 'primary' | 'muted';
  pinned?: boolean;
};

export const MOCK_THREADS: ThreadListEntry[] = [
  {
    id: '1',
    title: 'Creative Writing Prompt',
    timeLabel: '14:32',
    preview: 'The story begins in a forgotten clock tower...',
    icon: 'smart-toy',
    iconVariant: 'accent',
    previewEmphasis: 'strong',
    timeEmphasis: 'primary',
    pinned: true,
  },
  {
    id: '2',
    title: 'Python Code Review',
    timeLabel: '12:15',
    preview: 'Optimized the data fetching logic using async...',
    icon: 'forum',
    iconVariant: 'muted',
    previewEmphasis: 'subtle',
    timeEmphasis: 'muted',
  },
  {
    id: '3',
    title: 'Trip Planning: Tokyo',
    timeLabel: 'Yesterday',
    preview: 'Here is a 5-day itinerary for your visit to Shinjuku...',
    icon: 'forum',
    iconVariant: 'muted',
    previewEmphasis: 'subtle',
    timeEmphasis: 'muted',
  },
  {
    id: '4',
    title: 'Marketing Strategy Feedback',
    timeLabel: 'Tuesday',
    preview: 'The core messaging looks strong, but consider...',
    icon: 'forum',
    iconVariant: 'muted',
    previewEmphasis: 'subtle',
    timeEmphasis: 'muted',
  },
  {
    id: '5',
    title: 'Meal Prep Assistant',
    timeLabel: 'Monday',
    preview: 'Based on your ingredients: Quinoa salad with roasted...',
    icon: 'forum',
    iconVariant: 'muted',
    previewEmphasis: 'subtle',
    timeEmphasis: 'muted',
  },
];

export type TopicQuickItem = {
  id: string;
  label: string;
  icon: 'add' | 'terminal' | 'edit-note' | 'explore';
  variant: 'new' | 'default';
};

export const MOCK_TOPIC_CHIPS: TopicQuickItem[] = [
  { id: 'new', label: 'New', icon: 'add', variant: 'new' },
  { id: 'code', label: 'Code', icon: 'terminal', variant: 'default' },
  { id: 'writing', label: 'Writing', icon: 'edit-note', variant: 'default' },
  { id: 'travel', label: 'Travel', icon: 'explore', variant: 'default' },
];
