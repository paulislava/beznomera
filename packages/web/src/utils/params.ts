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

export const extractCode = async (params: Promise<{ code: string }>) => {
  const { code } = await params;

  if (!code || typeof code !== 'string' || code.trim() === '') {
    notFound();
  }

  return code;
};
