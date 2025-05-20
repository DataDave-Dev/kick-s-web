export const AcronymFunction = (username: string, maxLength: number = 3): string => {
    const words = username.split(' ');
    const acronym = words.map(word => word.charAt(0).toUpperCase()).join('');
    return acronym.slice(0, maxLength);
};

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