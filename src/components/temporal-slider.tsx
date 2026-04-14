'use client'

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemporalSliderProps {
    currentOffset: number;
    onDateChange: (offset: number) => void;
}

export function TemporalSlider({ currentOffset, onDateChange }: TemporalSliderProps) {
    const [offset, setOffset] = useState(currentOffset);

    useEffect(() => { setOffset(currentOffset); }, [currentOffset]);

    const MIN_OFFSET = -12;
    const MAX_OFFSET = 6;

    const getDateLabel = (offset: number): string => {
        const today = new Date();
        // Create a new date starting from the 1st to avoid end-of-month overflow bugs
        const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);

        const monthName = date.toLocaleDateString('es-CL', { month: 'long' });
        const year = date.getFullYear();

        // Capitalize first letter
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    };

    const handleSliderChange = (values: number[]) => {
        const newOffset = values[0];
        setOffset(newOffset);
        onDateChange(newOffset);
    };

    const handlePrevious = () => {
        if (offset > MIN_OFFSET) {
            const newOffset = offset - 1;
            setOffset(newOffset);
            onDateChange(newOffset);
        }
    };

    const handleNext = () => {
        if (offset < MAX_OFFSET) {
            const newOffset = offset + 1;
            setOffset(newOffset);
            onDateChange(newOffset);
        }
    };

    const jumpTo = (targetOffset: number) => {
        setOffset(targetOffset);
        onDateChange(targetOffset);
    };

    const isPast = offset < 0;
    const isFuture = offset > 0;
    const isPresent = offset === 0;

    // Color based on temporal state
    const badgeColor = isPast
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        : isFuture
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            : 'bg-primary/20 text-primary border-primary/30';

    const badgeLabel = isPast ? 'Histórico' : isFuture ? 'Proyección' : 'Actual';

    return (
        <div className="space-y-6 p-6 bg-card rounded-2xl border border-border">
            {/* Header with navigation */}
            <div className="flex items-center justify-between gap-4">
                <Button
                    onClick={handlePrevious}
                    disabled={offset <= MIN_OFFSET}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg bg-background hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </Button>

                <div className="flex-1 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-xl border border-border">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <span className="text-2xl font-bold text-foreground">
                                {getDateLabel(offset)}
                            </span>
                        </div>

                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeColor}`}>
                            {badgeLabel}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={handleNext}
                    disabled={offset >= MAX_OFFSET}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-lg bg-background hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed border border-border"
                >
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
            </div>

            {/* Slider */}
            <div className="px-2">
                <Slider
                    value={[offset]}
                    onValueChange={handleSliderChange}
                    min={MIN_OFFSET}
                    max={MAX_OFFSET}
                    step={1}
                    className="w-full"
                />

                {/* Timeline markers */}
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                    <span className="text-blue-400">-12 meses</span>
                    <span className="font-semibold text-primary">HOY</span>
                    <span className="text-purple-400">+6 meses</span>
                </div>
            </div>

            {/* Quick jump buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
                <Button
                    onClick={() => jumpTo(-3)}
                    variant="outline"
                    size="sm"
                    className="bg-background hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                >
                    -3 meses
                </Button>
                <Button
                    onClick={() => jumpTo(0)}
                    variant="outline"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 border-primary text-background-dark font-semibold"
                >
                    Hoy
                </Button>
                <Button
                    onClick={() => jumpTo(3)}
                    variant="outline"
                    size="sm"
                    className="bg-background hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                >
                    +3 meses
                </Button>
            </div>
        </div>
    );
}
