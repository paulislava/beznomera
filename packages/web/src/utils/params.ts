import { notFound } from 'next/navigation';

export const extractId = async (params: Promise<{ id: any }>) => {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  return id;
};

export const extractNumberId = async (params: Promise<{ id: number }>) => {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const idNumber = Number(id);

  if (!idNumber) {
    return notFound();
  }

  return idNumber;
};
