"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ProcedureState {
  dropdown: {
    isStarted: boolean;
    currentStep: Step;
    isAgreed: boolean;
    isDownloaded: boolean;
    uploadState: 'idle' | 'analyzing' | 'success';
    formData: {
      reason: string;
      expectedDate: string;
      contactAddress: string;
      notes: string;
    };
    studentProfile: {
      fullName: string;
      studentId: string;
      dob: string;
      classId: string;
      major: string;
      batch: string;
      phone: string;
      email: string;
    } | null;
  };
}

interface ProcedureContextType {
  state: ProcedureState;
  setDropoutStarted: (started: boolean) => void;
  setDropoutStep: (step: Step) => void;
  setDropoutAgreed: (agreed: boolean) => void;
  setDropoutDownloaded: (downloaded: boolean) => void;
  setDropoutUploadState: (uploadState: 'idle' | 'analyzing' | 'success') => void;
  setDropoutFormData: (data: Partial<ProcedureState['dropdown']['formData']>) => void;
  setDropoutStudentProfile: (profile: ProcedureState['dropdown']['studentProfile']) => void;
  resetDropout: () => void;
}

const ProcedureContext = createContext<ProcedureContextType | undefined>(undefined);

const initialState: ProcedureState = {
  dropdown: {
    isStarted: false,
    currentStep: 1,
    isAgreed: false,
    isDownloaded: false,
    uploadState: 'idle',
    formData: {
      reason: '',
      expectedDate: '',
      contactAddress: '',
      notes: '',
    },
    studentProfile: null,
  },
};

export function ProcedureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProcedureState>(initialState);

  const setDropoutStarted = (started: boolean) => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, isStarted: started }
    }));
  };

  const setDropoutStep = (step: Step) => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, currentStep: step }
    }));
  };

  const setDropoutAgreed = (agreed: boolean) => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, isAgreed: agreed }
    }));
  };

  const setDropoutDownloaded = (downloaded: boolean) => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, isDownloaded: downloaded }
    }));
  };

  const setDropoutUploadState = (uploadState: 'idle' | 'analyzing' | 'success') => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, uploadState }
    }));
  };

  const setDropoutFormData = (data: Partial<ProcedureState['dropdown']['formData']>) => {
    setState(prev => ({
      ...prev,
      dropdown: {
        ...prev.dropdown,
        formData: { ...prev.dropdown.formData, ...data }
      }
    }));
  };

  const setDropoutStudentProfile = (studentProfile: ProcedureState['dropdown']['studentProfile']) => {
    setState(prev => ({
      ...prev,
      dropdown: { ...prev.dropdown, studentProfile }
    }));
  };

  const resetDropout = () => {
    setState(prev => ({
      ...prev,
      dropdown: initialState.dropdown
    }));
  };

  return (
    <ProcedureContext.Provider value={{
      state,
      setDropoutStarted,
      setDropoutStep,
      setDropoutAgreed,
      setDropoutDownloaded,
      setDropoutUploadState,
      setDropoutFormData,
      setDropoutStudentProfile,
      resetDropout,
    }}>
      {children}
    </ProcedureContext.Provider>
  );
}

export function useProcedure() {
  const context = useContext(ProcedureContext);
  if (!context) {
    throw new Error('useProcedure must be used within a ProcedureProvider');
  }
  return context;
}