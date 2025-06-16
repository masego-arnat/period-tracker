import { db } from '../services/firebase.js';
import { getCurrentUser } from './auth.js';

export function calculateHealthInsights() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    db.collection("periods")
        .where("userId", "==", currentUser.uid)
        .orderBy("timestamp", "desc")
        .get()
        .then(querySnapshot => {
            const periods = querySnapshot.docs.map(doc => doc.data());
            
            if (periods.length < 2) {
                document.getElementById('cycleLength').textContent = 'Need more data';
                document.getElementById('periodDuration').textContent = 'Need more data';
                document.getElementById('nextPeriodPrediction').textContent = 'Need more data';
                document.getElementById('commonSymptoms').textContent = 'Need more data';
                return;
            }

            // Calculate cycle length
            const cycleLengths = [];
            for (let i = 0; i < periods.length - 1; i++) {
                const currentStart = new Date(periods[i].startDate);
                const nextStart = new Date(periods[i + 1].startDate);
                const diffDays = Math.round((currentStart - nextStart) / (1000 * 60 * 60 * 24));
                cycleLengths.push(Math.abs(diffDays));
            }
            const avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
            document.getElementById('cycleLength').textContent = `${avgCycleLength} days`;

            // Calculate period duration
            const durations = periods.map(period => {
                if (!period.endDate) return 0;
                const start = new Date(period.startDate);
                const end = new Date(period.endDate);
                return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            }).filter(d => d > 0);
            const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
            document.getElementById('periodDuration').textContent = `${avgDuration} days`;

            // Predict next period
            const lastPeriod = new Date(periods[0].startDate);
            const nextPeriod = new Date(lastPeriod);
            nextPeriod.setDate(lastPeriod.getDate() + avgCycleLength);
            document.getElementById('nextPeriodPrediction').textContent = 
                `Expected around ${nextPeriod.toLocaleDateString()}`;

            // Analyze common symptoms
            const symptoms = periods
                .map(p => p.symptoms)
                .filter(s => s)
                .join(', ')
                .toLowerCase()
                .split(/[,\s]+/);
            
            const symptomCounts = {};
            symptoms.forEach(symptom => {
                if (symptom) {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                }
            });

            const commonSymptoms = Object.entries(symptomCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([symptom, count]) => `${symptom} (${count} times)`)
                .join(', ');

            document.getElementById('commonSymptoms').textContent = 
                commonSymptoms || 'No symptoms recorded';
        })
        .catch(error => {
            console.error("Error calculating health insights:", error);
        });
} 