const prisma = require('../utils/prismaClient');

const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createExpense = async (req, res) => {
    try {
        const { date, category, amount, paymentMethod, description, voucherNo, paidTo, paidBy } = req.body;

        const expense = await prisma.expense.create({
            data: {
                date: date ? new Date(date) : new Date(),
                category,
                amount: parseFloat(amount),
                paymentMethod,
                description,
                voucherNo,
                paidTo,
                paidBy,
            },
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        await prisma.expense.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Expense log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getExpenses, createExpense, deleteExpense };
