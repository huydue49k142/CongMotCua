"use client";

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description: string;
}

interface WorkflowStepsProps {
  steps: Step[];
  currentStep: number;
}

const WorkflowSteps = ({ steps, currentStep }: WorkflowStepsProps) => {
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">📋 Tiến trình</h4>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
          Bước {currentStep}/{steps.length}
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Icon trạng thái */}
              <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'border-blue-500 bg-blue-50 text-blue-500 animate-pulse' 
                    : 'border-gray-300 bg-white text-gray-300'
              }`}>
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <span className="text-xs font-bold">{step.id}</span>
                )}
              </div>

              {/* Nội dung */}
              <div className={`flex-1 min-w-0 ${isPending ? 'opacity-40' : ''}`}>
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-slate-500'
                }`}>
                  {step.label}
                </p>
                {isCurrent && step.description && (
                  <p className="text-xs text-blue-600 mt-0.5">{step.description}</p>
                )}
              </div>

              {/* Mũi tên nối */}
              {step.id < steps.length && (
                <ChevronRight className={`h-4 w-4 mt-1 shrink-0 ${
                  isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;
