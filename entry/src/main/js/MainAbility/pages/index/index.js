import storage from '@system.storage';

const DAY_MS = 24 * 60 * 60 * 1000;

export default {
    data: {
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: 0,
        cycleDay: 0,
        phase: 'UNKNOWN',
        label: '',
        color: '#B0B0B0',
        progress: 0
    },

    onInit() {
        this.load();
    },

    load() {
        storage.get({
            key: 'lastPeriodStart',
            success: (res) => {
                if (res.data) {
                    this.lastPeriodStart = Number(res.data);
                } else {
                    this.setToday();
                }
                this.calculate();
            },
            fail: () => {
                this.setToday();
                this.calculate();
            }
        });
    },

    setToday() {
        const today = new Date().getTime();
        this.lastPeriodStart = today;
        storage.set({
            key: 'lastPeriodStart',
            value: today
        });
    },

    calculate() {
        const today = new Date().getTime();
        const diffDays = Math.floor((today - this.lastPeriodStart) / DAY_MS);
        this.cycleDay = (diffDays % this.cycleLength) + 1;
        this.phase = this.getPhase(this.cycleDay);
        this.progress = Math.round((this.cycleDay / this.cycleLength) * 100);
        this.updateUI();
    },

    getPhase(day) {
        if (day <= this.periodLength) {
            return 'MENSTRUAL';
        }
        if (day <= 13) {
            return 'FOLLICULAR';
        }
        if (day === 14) {
            return 'OVULATION';
        }
        return 'LUTEAL';
    },

    updateUI() {
        const map = {
            MENSTRUAL: { label: 'Period', color: '#E91E63' },
            FOLLICULAR: { label: 'Follicular', color: '#2196F3' },
            OVULATION: { label: 'Ovulation', color: '#4CAF50' },
            LUTEAL: { label: 'Luteal', color: '#9C27B0' }
        };
        const p = map[this.phase] || {
            label: 'Unknown',
            color: '#B0B0B0'
        };
        this.label = p.label;
        this.color = p.color;
    },

    nextDay() {
        this.cycleDay++;
        if (this.cycleDay > this.cycleLength) {
            this.cycleDay = 1;
        }
        const today = new Date().getTime();
        const newStart = today - (this.cycleDay - 1) * DAY_MS;
        this.lastPeriodStart = newStart;
        storage.set({
            key: 'lastPeriodStart',
            value: newStart
        });
        this.calculate();
    },

    resetCycle() {
        this.setToday();
        this.calculate();
    }
}