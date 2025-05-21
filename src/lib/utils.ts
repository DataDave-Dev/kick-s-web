export const formatDate = (date: string): string => {
  const timestamp = new Date(date);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const mes = meses[timestamp.getMonth()];
  const anio = timestamp.getFullYear();

  return `${mes} ${anio}`;
}

export const isPasswordValid = (password: string): boolean => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
}