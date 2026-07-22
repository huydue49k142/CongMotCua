"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type Condition = {
  text: string;
  details?: string | null;
};

type Props = {
  conditions: Condition[];
  onComplete: () => void;
};

export const ConditionChecklist = ({ conditions, onComplete }: Props) => {
  const [checkedState, setCheckedState] = useState(
    new Array(conditions.length).fill(false)
  );
  const [isCompleted, setIsCompleted] = useState(false);

  const handleOnChange = (position: number) => {
    if (isCompleted) return; // Don't allow changes after completion
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };
  
  const passedCount = checkedState.filter(Boolean).length;
  const allPassed = passedCount === conditions.length;

  useEffect(() => {
    if (allPassed && !isCompleted) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Wait half a second before calling onComplete
      return () => clearTimeout(timer);
    }
  }, [allPassed, onComplete, isCompleted]);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-bold text-slate-800">
          ĐIỀU KIỆN THỰC HIỆN
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${allPassed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {passedCount}/{conditions.length} hoàn thành
        </span>
      </div>
      <ul className="space-y-1">
        {conditions.map((item, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <button
              onClick={() => handleOnChange(index)}
              disabled={isCompleted}
              className="flex w-full text-left items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mt-0.5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: checkedState[index] ? '#22c55e' : '#cbd5e1',
                  backgroundColor: checkedState[index] ? '#22c55e' : 'transparent',
                }}
              >
                {checkedState[index] && <CheckCircle className="h-4 w-4 text-white" />}
              </div>
              
              <div>
                <p className={`font-semibold ${checkedState[index] ? 'text-slate-700' : 'text-slate-600'}`}>{item.text}</p>
                {item.details && <p className="text-sm text-slate-500 mt-1">{item.details}</p>}
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
