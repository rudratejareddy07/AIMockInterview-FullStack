export type Interview = {
  id: string;
  interviewType: 'Frontend' | 'Backend' | 'Data Structures' | 'System Design';
  date: string;
  score: number;
  transcript: string;
};

export const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    interviewType: 'Frontend',
    date: '2024-07-20',
    score: 7,
    transcript: `AI: Hello, welcome to your mock interview. Let's start with a classic frontend question. Can you explain the difference between 'null' and 'undefined' in JavaScript?
User: Sure. 'undefined' means a variable has been declared but has not yet been assigned a value. 'null' is an assignment value. It can be assigned to a variable as a representation of no value.
AI: That's correct. Now, can you describe the box model in CSS?
User: The CSS box model is a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.
AI: Good. Let's move to React. What are hooks? Can you name a few?
User: Hooks are functions that let you "hook into" React state and lifecycle features from function components. Examples are useState, useEffect, and useContext.
AI: Excellent. Thank you for your time. Your feedback report will be generated shortly.`
  },
  {
    id: 'interview-2',
    interviewType: 'Data Structures',
    date: '2024-07-27',
    score: 8,
    transcript: `AI: Welcome. Your first question is: What is a Linked List and how does it differ from an array?
User: A Linked List is a linear data structure, but unlike arrays, elements are not stored at a contiguous location. The elements are linked using pointers. This allows for efficient insertions and deletions.
AI: Correct. Now, please explain what a Hash Table is.
User: A Hash Table is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.
AI: Very well explained. That concludes this interview.`
  },
  {
    id: 'interview-3',
    interviewType: 'System Design',
    date: '2024-08-05',
    score: 6,
    transcript: `AI: Hello. Let's begin. How would you design a URL shortening service like TinyURL?
User: Um, I'd start with a database to store the long URL and the generated short key. When a user enters a long URL, we generate a unique short key, maybe 6-8 characters long using a-z, A-Z, 0-9. We check if the key is already in the database. If not, we store the pair. When a user hits the short URL, we do a database lookup for the long URL and redirect them.
AI: How would you handle generating a unique key at scale?
User: We could pre-generate a large batch of keys and store them in a separate table. When a request comes in, we just grab one. Or use a hashing function like MD5 on the long URL and take the first few characters. There might be collisions though.
AI: Okay, thank you. We will now conclude the session.`
  },
];

export const getInterviewById = (id: string) => {
  return mockInterviews.find((interview) => interview.id === id);
};

export const performanceData = [
    { date: '2024-07-20', score: 7 },
    { date: '2024-07-27', score: 8 },
    { date: '2024-08-05', score: 6 },
];
