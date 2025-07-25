import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  goToStep: (step: number) => void;
}

export function ProgressBar({ steps, currentStep, goToStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step} className="flex items-center w-full">
            <button
              onClick={() => goToStep(stepNumber)}
              disabled={stepNumber >= currentStep && !isCompleted}
              className="flex flex-col items-center gap-2 text-center transition-colors disabled:cursor-not-allowed"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300',
                  isCompleted ? 'bg-primary border-primary text-primary-foreground' : '',
                  isActive ? 'bg-primary/20 border-primary text-primary scale-110' : '',
                  !isCompleted && !isActive ? 'bg-card border-border text-muted-foreground' : ''
                )}
              >
                {isCompleted ? <Check className="h-6 w-6" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-grow h-1 mx-2 sm:mx-4 transition-colors duration-500',
                isCompleted ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
