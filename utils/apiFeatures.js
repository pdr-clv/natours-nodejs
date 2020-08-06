class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    //we exclude several fields not related with the find({}) object.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);
    //Filter advanced, adding posibility of gte, gt, lte and lt in the request querry.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //we create sortBy, we get request.sort, we split it into an array, spliting by comma, and we join it into an string separated with spaces, this is the argument that needs sort
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //if we want to sort by several fields, ve can chain with spaces sort('price' 'ratingsAverage' 'etc')
    } else {
      //default sort by createdAt descending.
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      //you can also hide fields in the search adding -name, and name will not be showed in query Collection
    } else {
      //default fields filter is to remove the __v, Mongo uses it, but we don't need it.
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
