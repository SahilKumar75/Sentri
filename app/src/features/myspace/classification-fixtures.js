// Classification test fixtures for Myspace capture inputs

const classificationFixtures = {
  // Text samples representing different categories
  textSamples: [
    {
      text: "Meeting notes from team sync - discussed Q4 priorities and budget allocation",
      expectedCategory: "work"
    },
    {
      text: "Recipe for chocolate chip cookies: flour, eggs, sugar, chocolate chips",
      expectedCategory: "personal"
    },
    {
      text: "Lecture notes on quantum physics - wave particle duality and Schrodinger's equation",
      expectedCategory: "education"
    },
    {
      text: "Grocery list: milk, bread, eggs, vegetables, chicken breast",
      expectedCategory: "personal"
    },
    {
      text: "Project proposal draft for client presentation - include timeline and budget",
      expectedCategory: "work"
    }
  ],

  // File names representing different categories
  fileNames: [
    {
      name: "Q4_Budget_Spreadsheet.xlsx",
      expectedCategory: "work"
    },
    {
      name: "Vacation_Photos_2023.zip",
      expectedCategory: "personal"
    },
    {
      name: "Machine_Learning_Course_Syllabus.pdf",
      expectedCategory: "education"
    },
    {
      name: "Team_Member_Performance_Reviews.docx",
      expectedCategory: "work"
    },
    {
      name: "Home_Renovation_Contracts.pdf",
      expectedCategory: "personal"
    }
  ],

  // URLs representing different categories
  urls: [
    {
      url: "https://company.intranet/projects/q4-initiatives",
      expectedCategory: "work"
    },
    {
      url: "https://recipes.com/chocolate-chip-cookies-master-recipe",
      expectedCategory: "personal"
    },
    {
      url: "https://university.edu/courses/quantum-physics/lecture-notes",
      expectedCategory: "education"
    },
    {
      url: "https://github.com/company/project-management-tool",
      expectedCategory: "work"
    },
    {
      url: "https://fitness-tracker.app/dashboard/weekly-summary",
      expectedCategory: "personal"
    }
  ],

  // Mixed content captures
  mixedContent: [
    {
      content: "Team meeting notes + Q4_Budget_Spreadsheet.xlsx attachment",
      expectedCategory: "work"
    },
    {
      content: "Vacation planning notes with https://travel-site.com/destinations links",
      expectedCategory: "personal"
    },
    {
      content: "Study group discussion about https://university.edu/assignments/hw3.pdf",
      expectedCategory: "education"
    }
  ]
};

export default classificationFixtures;