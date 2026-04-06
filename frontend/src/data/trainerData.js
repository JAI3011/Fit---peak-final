// Mock data for trainer dashboard

export const trainerInfo = {
  id: "trainer_001",
  name: "Rahul Sharma",
  email: "rahul.sharma@fitpeak.com",
  phone: "+91 98765 43210",
  rating: 4.8,
  totalClients: 12,
  activePrograms: 8,
  specialization: "Strength Training",
  certifications: ["NASM-CPT", "Precision Nutrition Level 1"],
  experience: "8 years"
};

export const clients = [
  {
    id: '1',
    name: "Jaysmin Patel",
    avatar: "JP",
    email: "jaysmin@example.com",
    phone: "+91 98765 11111",
    age: 22,
    gender: "Female",
    height: 170,
    weight: 70,
    goal: "Muscle Gain",
    startDate: "Jan 15, 2026",
    currentProgram: "12-Week Muscle Building",
    progress: 65,
    adherence: 92,
    workoutsCompleted: 32,
    workoutsThisWeek: 4,
    mealsLogged: 85,
    lastActive: "2 hours ago"
  },
  {
    id: '2',
    name: "Rohan Mehta",
    avatar: "RM",
    email: "rohan@example.com",
    phone: "+91 98765 22222",
    age: 28,
    gender: "Male",
    height: 178,
    weight: 85,
    goal: "Weight Loss",
    startDate: "Feb 1, 2026",
    currentProgram: "Fat Loss Program",
    progress: 45,
    adherence: 78,
    workoutsCompleted: 24,
    workoutsThisWeek: 3,
    mealsLogged: 70,
    lastActive: "1 day ago"
  },
  {
    id: '3',
    name: "Priya Singh",
    avatar: "PS",
    email: "priya@example.com",
    phone: "+91 98765 33333",
    age: 25,
    gender: "Female",
    height: 165,
    weight: 60,
    goal: "Athletic Performance",
    startDate: "Dec 10, 2025",
    currentProgram: "Athlete Training",
    progress: 80,
    adherence: 95,
    workoutsCompleted: 48,
    workoutsThisWeek: 5,
    mealsLogged: 95,
    lastActive: "3 hours ago"
  },
  {
    id: '4',
    name: "Arjun Kumar",
    avatar: "AK",
    email: "arjun@example.com",
    phone: "+91 98765 44444",
    age: 30,
    gender: "Male",
    height: 175,
    weight: 75,
    goal: "Muscle Gain",
    startDate: "Jan 20, 2026",
    currentProgram: "Hypertrophy Program",
    progress: 55,
    adherence: 85,
    workoutsCompleted: 28,
    workoutsThisWeek: 4,
    mealsLogged: 80,
    lastActive: "5 hours ago"
  },
  {
    id: '5',
    name: "Neha Sharma",
    avatar: "NS",
    email: "neha@example.com",
    phone: "+91 98765 55555",
    age: 27,
    gender: "Female",
    height: 168,
    weight: 65,
    goal: "Weight Loss",
    startDate: "Feb 5, 2026",
    currentProgram: "Lean & Toned",
    progress: 70,
    adherence: 90,
    workoutsCompleted: 30,
    workoutsThisWeek: 5,
    mealsLogged: 92,
    lastActive: "1 hour ago"
  }
];

export const workoutTemplates = [
  {
    id: '1',
    name: "Chest + Triceps",
    duration: "45 min",
    intensity: "High",
    day: "Monday",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, rest: 90 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: 60 },
      { name: "Cable Flyes", sets: 3, reps: 12, rest: 60 },
      { name: "Tricep Dips", sets: 3, reps: 12, rest: 60 },
      { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: 60 }
    ]
  },
  {
    id: '2',
    name: "Back + Biceps",
    duration: "50 min",
    intensity: "Medium",
    day: "Tuesday",
    exercises: [
      { name: "Deadlift", sets: 4, reps: 6, rest: 120 },
      { name: "Pull-ups", sets: 3, reps: 10, rest: 90 },
      { name: "Barbell Rows", sets: 4, reps: 8, rest: 90 },
      { name: "Lat Pulldown", sets: 3, reps: 12, rest: 60 },
      { name: "Barbell Curl", sets: 3, reps: 10, rest: 60 }
    ]
  },
  {
    id: '3',
    name: "Legs",
    duration: "60 min",
    intensity: "High",
    day: "Thursday",
    exercises: [
      { name: "Squats", sets: 4, reps: 8, rest: 120 },
      { name: "Leg Press", sets: 3, reps: 12, rest: 90 },
      { name: "Lunges", sets: 3, reps: 10, rest: 60 },
      { name: "Leg Curls", sets: 3, reps: 12, rest: 60 },
      { name: "Calf Raises", sets: 4, reps: 15, rest: 45 }
    ]
  }
];

export const mealPlanTemplates = [
  {
    id: '1',
    name: "High Protein Meal Plan",
    calories: 2500,
    dailyProtein: 180,
    goal: "Muscle Gain",
    meals: [
      {
        name: "Breakfast",
        time: "7:00 AM",
        items: [
          { name: "Scrambled Eggs", quantity: "4 eggs", calories: 280, protein: 24 },
          { name: "Whole Wheat Toast", quantity: "2 slices", calories: 160, protein: 8 },
          { name: "Avocado", quantity: "1/2", calories: 120, protein: 2 }
        ]
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        items: [
          { name: "Grilled Chicken", quantity: "200g", calories: 330, protein: 62 },
          { name: "Brown Rice", quantity: "150g", calories: 170, protein: 4 },
          { name: "Vegetables", quantity: "1 cup", calories: 50, protein: 2 }
        ]
      },
      {
        name: "Dinner",
        time: "8:00 PM",
        items: [
          { name: "Salmon", quantity: "180g", calories: 360, protein: 40 },
          { name: "Sweet Potato", quantity: "200g", calories: 180, protein: 4 },
          { name: "Salad", quantity: "1 bowl", calories: 50, protein: 2 }
        ]
      }
    ]
  }
];

export const trainerData = {
  info: trainerInfo,
  clients,
  templates: {
    workouts: workoutTemplates,
    dietPlans: mealPlanTemplates
  }
};
