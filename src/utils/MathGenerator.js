// Utilidad para generar ejercicios matemáticos infinitos

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + Math.floor(min);

const generateDistractors = (correctAnswer, isString = false) => {
    if (isString) return [];
    
    let distractors = new Set();
    while (distractors.size < 2) {
        let offset = randomInt(1, 10) * (Math.random() > 0.5 ? 1 : -1);
        let distractor = correctAnswer + offset;
        // Sometimes try a digit swap mistake for realism
        if (Math.random() > 0.5 && correctAnswer.toString().length > 1) {
            let str = correctAnswer.toString();
            let arr = str.split('');
            let temp = arr[0];
            arr[0] = arr[1];
            arr[1] = temp;
            let swapped = parseInt(arr.join(''));
            if (!isNaN(swapped) && swapped !== correctAnswer) distractor = swapped;
        }
        if (distractor !== correctAnswer && distractor >= 0) {
            distractors.add(distractor);
        }
    }
    
    const options = [correctAnswer, ...Array.from(distractors)];
    return options.sort(() => Math.random() - 0.5); // Shuffle
};

export const generateOperations = (count = 4, maxDigits = 3, type = 'mix') => {
    const exercises = [];
    for (let i = 0; i < count; i++) {
        let isAddition = Math.random() > 0.5;
        if (type === 'add') isAddition = true;
        if (type === 'sub') isAddition = false;
        
        const max = Math.pow(10, maxDigits) - 1;
        const min = Math.pow(10, maxDigits - 1);
        
        let a = randomInt(min, max);
        let b = randomInt(min, max);
        
        if (!isAddition && b > a) {
            // Swap to avoid negative numbers
            let temp = a;
            a = b;
            b = temp;
        }
        
        const answer = isAddition ? a + b : a - b;
        const text = `${a} ${isAddition ? '+' : '-'} ${b} =`;
        
        exercises.push({
            id: `op_${i}`,
            text,
            answer,
            options: generateDistractors(answer)
        });
    }
    return exercises;
};

export const generateMultiplications = (count = 4, maxDigits = 2) => {
    const exercises = [];
    for (let i = 0; i < count; i++) {
        const maxA = Math.pow(10, maxDigits) - 1;
        const minA = maxDigits > 1 ? 10 : 2;
        const a = randomInt(minA, maxA);
        
        // B can be slightly simpler or equal digits
        const b = randomInt(2, maxA);
        
        const answer = a * b;
        const text = `${a} x ${b} =`;
        
        exercises.push({
            id: `mul_${i}`,
            text,
            answer,
            options: generateDistractors(answer)
        });
    }
    return exercises;
};

export const generateTimesTable = (baseNumber) => {
    const table = [];
    for (let i = 1; i <= 10; i++) {
        const answer = baseNumber * i;
        table.push({
            id: `tt_${i}`,
            text: `${baseNumber} x ${i} =`,
            answer,
            options: generateDistractors(answer)
        });
    }
    return table;
};

export const generateWordProblem = () => {
    const templates = [
        {
            story: (a, b) => `Steve encontró ${a} diamantes en la cueva, pero un Creeper explotó y perdió ${b}.`,
            question: "¿Cuántos diamantes le quedaron?",
            calc: (a, b) => a - b,
            minA: 50, maxA: 150, minB: 10, maxB: 45
        },
        {
            story: (a, b) => `Ambar quiere construir una casa. Necesita ${a} bloques de madera y ya tiene ${b}.`,
            question: "¿Cuántos bloques le faltan?",
            calc: (a, b) => a - b,
            minA: 200, maxA: 500, minB: 50, maxB: 199
        },
        {
            story: (a, b) => `Alekei cosechó ${a} zanahorias en su granja y se las repartió a ${b} cerditos por igual.`,
            question: "¿Cuántas zanahorias le tocaron a cada cerdito?",
            calc: (a, b) => a / b,
            minA: 20, maxA: 100, minB: 2, maxB: 5,
            ensureDivisible: true
        }
    ];
    
    const t = templates[randomInt(0, templates.length - 1)];
    let a, b;
    if (t.ensureDivisible) {
        b = randomInt(t.minB, t.maxB);
        // FIX for decimals: use Math.ceil and Math.floor to ensure integer multiplier bounds
        const multiplier = randomInt(Math.ceil(t.minA/b), Math.floor(t.maxA/b));
        a = b * multiplier;
    } else {
        a = randomInt(t.minA, t.maxA);
        b = randomInt(t.minB, t.maxB);
    }
    
    const answer = t.calc(a, b);
    
    return {
        id: `word_${Math.random()}`,
        storyText: t.story(a, b),
        question: t.question,
        answer,
        options: generateDistractors(answer)
    };
};

export const generateFractions = () => {
    const fractions = [
        { num: 1, den: 2 },
        { num: 1, den: 4 },
        { num: 3, den: 4 },
        { num: 1, den: 3 },
        { num: 2, den: 3 },
        { num: 2, den: 4 },
        { num: 1, den: 5 },
        { num: 2, den: 5 },
        { num: 3, den: 5 },
        { num: 4, den: 5 }
    ];
    
    const selected = fractions[randomInt(0, fractions.length - 1)];
    const text = `${selected.num}/${selected.den}`;
    
    // Generate distractors (other string fractions)
    let dists = new Set();
    while (dists.size < 2) {
        let alt = fractions[randomInt(0, fractions.length - 1)];
        let altText = `${alt.num}/${alt.den}`;
        if (altText !== text) dists.add(altText);
    }
    const options = [text, ...Array.from(dists)].sort(() => Math.random() - 0.5);
    
    return {
        id: `frac_${Math.random()}`,
        num: selected.num,
        den: selected.den,
        text,
        answer: text,
        options
    };
};
