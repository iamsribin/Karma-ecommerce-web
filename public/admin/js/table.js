let items = []
for(var i=0; i<20000; i++){
  items.push({
    key: i+1,
    ssn: chance.ssn(),  // SSN as person ID
    name: chance.name(),
    email: chance.email(),
    address: chance.address(),
    phone: chance.phone(),
    selected: false
  })
}

Vue.filter('numeral', function (value) {
  return numeral(value).format('0,0');
})

new Vue({
  el: '#app',
  data: {
    searchItem: '',
    items: items,
    filteredItems: [],
    paginatedItems: [],
    selectedItems: [],
    pagination: {
      range: 5,
      currentPage: 1,
      itemPerPage: 8,
      items: [],
      filteredItems: [],
    }
  },
  ready() {
    this.filteredItems = this.items
    this.buildPagination()
    this.selectPage(1)    
  },
  methods: {
    clearSearchItem(){
      this.searchItem = undefined
      this.searchInTheList('')
    },
    searchInTheList(searchText, currentPage){
      if(_.isUndefined(searchText)){
        this.filteredItems = _.filter(this.items, function(v, k){
          return !v.selected
        })
      }
      else{
        this.filteredItems = _.filter(this.items, function(v, k){
          return !v.selected && v.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        })
      }
      this.filteredItems.forEach(function(v, k){
        v.key = k+1
      })  
      this.buildPagination()
      
      if(_.isUndefined(currentPage)){
        this.selectPage(1) 
      }
      else{
        this.selectPage(currentPage)
      }
    },
    buildPagination(){
      let numberOfPage = Math.ceil(this.filteredItems.length/this.pagination.itemPerPage)
      this.pagination.items = []
      for(var i=0; i<numberOfPage; i++){
        this.pagination.items.push(i+1)
      }
    },
    selectPage(item) {
      this.pagination.currentPage = item
      
      let start = 0
      let end = 0
      if(this.pagination.currentPage < this.pagination.range-2){
        start = 1
        end = start+this.pagination.range-1
      }
      else if(this.pagination.currentPage <= this.pagination.items.length && this.pagination.currentPage > this.pagination.items.length - this.pagination.range + 2){
        start = this.pagination.items.length-this.pagination.range+1
        end = this.pagination.items.length
      }
      else{
        start = this.pagination.currentPage-2
        end = this.pagination.currentPage+2
      }
      if(start<1){
        start = 1
      }
      if(end>this.pagination.items.length){
        end = this.pagination.items.length
      }
      
      this.pagination.filteredItems = []
      for(var i=start; i<=end; i++){
        this.pagination.filteredItems.push(i);
      }
      
      this.paginatedItems = this.filteredItems.filter((v, k) => {
        return Math.ceil((k+1) / this.pagination.itemPerPage) == this.pagination.currentPage
      })
    },
    selectItem(item){
      item.selected = true
      this.selectedItems.push(item)
      this.searchInTheList(this.searchItem, this.pagination.currentPage)
    },    
    removeSelectedItem(item){
      item.selected = false
      this.selectedItems.$remove(item)
      this.searchInTheList(this.searchItem, this.pagination.currentPage)
    }
  }
})