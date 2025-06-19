export function extractSessionMetadata(filename, data) {
  const shots = data.length;
  const clubList = Array.from(new Set(data.map(entry => entry["Club Type"])));

  return {
    filename,
    shots,
    availableClubs: clubList
  };
}