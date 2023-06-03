const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((elm) => {
    if (allowedFields.includes(elm)) newObj[elm] = obj[elm];
  });
  return newObj;
};

module.exports = filterObj;
