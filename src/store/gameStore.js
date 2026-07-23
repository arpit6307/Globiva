import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  currentCourse: null,
  currentLevelIndex: 0,
  completedLevels: [], // Array of section indices completed
  streak: 0,
  isCourseComplete: false,
  isMcqUnlocked: false,
  answerLog: [], // Log of MCQ answers: { questionId, selectedIndex, correct }
  
  // Game Actions
  startCourse: (course) => {
    set({
      currentCourse: course,
      currentLevelIndex: 0,
      completedLevels: [],
      streak: 0,
      isCourseComplete: false,
      isMcqUnlocked: false,
      answerLog: []
    });
  },

  completeLevel: (index) => {
    const { completedLevels, currentCourse } = get();
    const updatedCompleted = completedLevels.includes(index) 
      ? completedLevels 
      : [...completedLevels, index];
    
    const allSectionsDone = updatedCompleted.length === (currentCourse?.sections?.length || 0);
    
    set({
      completedLevels: updatedCompleted,
      isMcqUnlocked: allSectionsDone
    });
  },

  nextLevel: () => {
    const { currentLevelIndex, currentCourse } = get();
    if (currentLevelIndex < (currentCourse?.sections?.length || 0) - 1) {
      set({ currentLevelIndex: currentLevelIndex + 1 });
    }
  },

  selectLevelIndex: (index) => {
    const { completedLevels } = get();
    // Allow jumping to any level that is completed, or the first uncompleted level
    const maxUnlocked = completedLevels.length;
    if (index <= maxUnlocked) {
      set({ currentLevelIndex: index });
    }
  },

  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  
  resetStreak: () => set({ streak: 0 }),
  
  submitMcqAnswer: (questionId, selectedIndex, correct) => {
    set((state) => ({
      answerLog: [...state.answerLog, { questionId, selectedIndex, correct }]
    }));
  },

  resetStore: () => set({
    currentCourse: null,
    currentLevelIndex: 0,
    completedLevels: [],
    xp: 0,
    streak: 0,
    isCourseComplete: false,
    isMcqUnlocked: false,
    answerLog: []
  })
}));

export default useGameStore;
