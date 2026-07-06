// Mock feedback responses with linked digital solution states
export const initialMockResponses = [
  {
    id: "fb-1",
    timestamp: new Date().toISOString(), // Today
    problems: ["Food / Mess / Canteen"],
    frequency: "Daily",
    affected: "Students",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Website Portal", "Booking / Scheduling System"],
    userGroup: "Students",
    description: "The queue at the canteen during lunch hours is extremely long. A digital ordering/booking portal would allow students to preorder food and reduce the crowd size.",
    priority: "Medium",
    status: "In Progress",
    solution: {
      name: "Canteen Pre-Order & Booking Portal",
      type: "Website Portal",
      status: "Deployed",
      description: "An online menu and pre-ordering web portal enabling students to purchase lunch slots in advance and skip the main queues."
    }
  },
  {
    id: "fb-2",
    timestamp: new Date().toISOString(), // Today
    problems: ["Infrastructure (classroom, lab, hostel, washroom, etc.)"],
    frequency: "Daily",
    affected: "Everyone",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Chatbot / Helpdesk", "QR-based System"],
    userGroup: "Both",
    description: "The washroom on the 2nd floor of Block A is constantly lacking water and soap. A QR-based quick reporting system on the washroom door could help trigger maintenance alerts automatically.",
    priority: "High",
    status: "Pending",
    solution: {
      name: "QR Restroom Alert System",
      type: "QR-based System",
      status: "In Development",
      description: "Custom scan codes placed in all public restrooms that trigger high-priority maintenance requests directly to cleaning teams."
    }
  },
  {
    id: "fb-3",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    problems: ["Internet / Wi-Fi"],
    frequency: "Weekly",
    affected: "Students",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Notification / Alert System"],
    userGroup: "Both",
    description: "Library Wi-Fi frequently disconnects after 4 PM, especially near the study desks. We need a live notification system or status page showing Wi-Fi load and uptime.",
    priority: "High",
    status: "Resolved",
    solution: {
      name: "Library Wi-Fi Load Monitor",
      type: "Website Portal",
      status: "Deployed",
      description: "A web dashboard integrated with the library APs showing real-time load and alerting students on high latency zones."
    }
  },
  {
    id: "fb-4",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    problems: ["Administration / Paperwork"],
    frequency: "Occasionally",
    affected: "Faculty",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Website Portal"],
    userGroup: "Admin/Staff",
    description: "Reimbursement claims for academic materials require printing physical forms and manually walking them to the finance office. Implementing a scanned PDF approval portal would save weeks of processing time.",
    priority: "Low",
    status: "In Progress",
    solution: null
  },
  {
    id: "fb-5",
    timestamp: new Date().toISOString(), // Today
    problems: ["Safety / Security"],
    frequency: "Daily",
    affected: "Everyone",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Mobile App", "Notification / Alert System"],
    userGroup: "Both",
    description: "Streetlights from the science block to the hostel gates are broken and off for a week. Walking there at night feels unsafe. An emergency alert button on the campus app would help security staff track patrols.",
    priority: "High",
    status: "Pending",
    solution: {
      name: "Campus Forest SafeNav App",
      type: "Mobile App",
      status: "In Development",
      description: "An offline companion map app showing lighted trails, safety escort requests, and hazards (such as broken streetlights) for student navigation."
    }
  },
  {
    id: "fb-6",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    problems: ["Mental Health / Wellbeing"],
    frequency: "Occasionally",
    affected: "Students",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Chatbot / Helpdesk", "Booking / Scheduling System"],
    userGroup: "Students",
    description: "Getting counselor appointments is highly intimidating because you have to walk in physically to book. An anonymous scheduling portal would make it much easier for students in crisis to seek guidance.",
    priority: "Medium",
    status: "Resolved",
    solution: {
      name: "MindCare Booking Portal",
      type: "Booking / Scheduling System",
      status: "Deployed",
      description: "An anonymous booking system that provides encrypted slot selection for counseling appointments without sharing personal data."
    }
  },
  {
    id: "fb-7",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    problems: ["Infrastructure (classroom, lab, hostel, washroom, etc.)", "Faculty / Teaching"],
    frequency: "Weekly",
    affected: "Faculty",
    digitalToolHelp: "Yes",
    digitalToolTypes: ["Notification / Alert System"],
    userGroup: "Both",
    description: "Projectors in Hall 3 keep flickering and shutting down mid-lecture. It disrupts classes consistently. Need an alert/ticket system to report IT issues instantly.",
    priority: "Medium",
    status: "Pending",
    solution: null
  },
  {
    id: "fb-8",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    problems: ["Faculty / Teaching"],
    frequency: "Rarely / One-time",
    affected: "Students",
    digitalToolHelp: "No",
    digitalToolTypes: [],
    userGroup: "Students",
    description: "Assignment feedback for the mid-semester paper was only given as a letter grade without any comments or guidance. It makes it very hard to know how to improve for the finals.",
    priority: "Low",
    status: "Pending",
    solution: null
  }
];
