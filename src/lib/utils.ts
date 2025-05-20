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