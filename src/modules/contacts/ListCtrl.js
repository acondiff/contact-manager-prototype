app.controller('ListCtrl', ['$scope', '$rootScope', '$http', '$store', function($scope, $rootScope, $http, $store) {

    var list = [];

    $scope.listOrder = function(predicate) {
        $scope.reverse = (JSON.stringify($scope.predicate) === JSON.stringify(predicate)) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };

    $scope.editContact = function() {
        $scope.editingContact = true;
    };

    $scope.cancelEditContact = function() {
        $scope.editingContact = false;
        $scope.selectContact($scope.activeContact.id);
        if($scope.addingNewContact) {
            $scope.removeNewContact();
        }
    };

    $scope.saveEditContact = function() {
        $scope.editingContact = false;
        $scope.addingNewContact = false;
        var saveId = $scope.activeContact.id;
        for(i in $scope.list) {
            if(saveId === $scope.list[i].id) {
                delete $scope.activeContact.positionString;
                $scope.list[i] = $scope.activeContact;
            }
        }
        $scope.selectContact($scope.activeContact.id);
    };

    $scope.encodeAvatar = function(el) {
      var preview = document.querySelector('img');
      var file = el[0].files[0];
      var reader = new FileReader();
      console.log("ENCODING AVATAR...");

      reader.addEventListener("load", function () {
        $scope.$apply(function() {
          $scope.activeContact.photo = reader.result;
        });
        $scope.saveEditContact();
      }, false);

      if (file) {
        reader.readAsDataURL(file);
      }
    };

    $scope.addNewContact = function() {
        if(!$scope.addingNewContact) {
            var listId = 0;
            for(i in $scope.list) {
                if(listId < $scope.list[i].id) {
                    listId = $scope.list[i].id;
                }
            }
            listId++;
            $scope.list.push({});
            $scope.list[$scope.list.length-1].id = listId;
            $scope.selectContact(listId);
            $scope.editingContact = true;
            $scope.addingNewContact = true;
        }
    };

    $scope.removeNewContact = function() {
        $scope.list.splice($scope.list.length-1,1);
        $scope.addingNewContact = false;
        $scope.selectContactByIndex($scope.filteredListContactIndex-1);
    };

    $scope.deleteContact = function(id) {
        var contactIndexBeforeDeleted = 0;
        id = (!id) ? $scope.activeContact.id : id;
        if($scope.list.length > 0) {
            for(i in $scope.list) {
                if(id === $scope.list[i].id) {
                    contactIndexBeforeDeleted = parseInt($scope.filteredListContactIndex);
                    $scope.list.splice(i,1);
                }
            }
            $scope.addingNewContact = false;
            $scope.editingContact = false;
            $scope.$apply();
            if(contactIndexBeforeDeleted < $scope.filteredList.length-1) {
                $scope.selectContactByIndex(parseInt($scope.filteredListContactIndex));
            } else {
                $scope.selectContactByIndex($scope.filteredList.length-1);
            }
        }
    };

    $scope.selectContact = function(id) {
        $scope.editingContact = false;
        for(i in $scope.filteredList) {
            if($scope.filteredList[i].id === id ) {
                $scope.filteredListContactIndex = i;
            }
        }
        for(i in $scope.list) {
            if($scope.list[i].id === id) {
                $scope.listContactIndex = i;
            }
        }
        var contact = $scope.list[$scope.listContactIndex];
        contact = angular.toJson(contact,true);
        contact = JSON.parse(contact);
        $scope.activeContact = contact;
        $scope.activeContact.positionString = '';
        if($scope.addingNewContact) {
            $scope.removeNewContact();
        }
        $('.list-body-wrap').focus();
    };

    $scope.selectContactByIndex = function(index) {
        $scope.selectContact($scope.filteredList[index].id);
    };

    $scope.selectPrevContact = function() {
        if($scope.filteredListContactIndex>0) {
            $scope.selectContactByIndex(parseInt($scope.filteredListContactIndex)-1);
        }
    }

    $scope.selectNextContact = function() {
        if($scope.filteredListContactIndex<$scope.filteredList.length-1) {
            $scope.selectContactByIndex(parseInt($scope.filteredListContactIndex)+1);
        }
    }

    $scope.scrollToSelection = function() {
        var scrollWrap = $('.list-body-wrap');
        var itemHeight = 48;
        var adjWindowScroll = scrollWrap.scrollTop()+scrollWrap.height()-itemHeight;
        var adjSelectedScroll = $scope.filteredListContactIndex*48;
        if(adjSelectedScroll > adjWindowScroll) {
            scrollWrap.scrollTop(adjSelectedScroll-scrollWrap.height()+itemHeight-1);
        } else if(scrollWrap.scrollTop() > $scope.filteredListContactIndex*48) {
            scrollWrap.scrollTop($scope.filteredListContactIndex*48);
        }
    }

    $scope.keyPress = function(e) {
        var key = {
            tab: 9,
            enter: 13,
            esc: 27,
            space: 32,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            shift: 16,
            ctrl: 17,
            alt: 18,
            backspace: 8,
            del: 46,
            command: 91
        };
        if(e.keyCode == key.up || e.keyCode == key.down || e.keyCode == key.del || e.keyCode == key.backspace) {
            e.preventDefault();
        }
        switch(e.keyCode) {
            case key.up: $scope.selectPrevContact(); $scope.scrollToSelection();
            break;
            case key.down: $scope.selectNextContact(); $scope.scrollToSelection();
            break;
            case key.del: $scope.deleteContact($scope.activeContact.id);
            break;
            case key.backspace: $scope.deleteContact($scope.activeContact.id);
            break;
        }
    }

    $scope.refreshData = function() {
        $scope.list = [];
        list = [];
        $scope.list = list;
    }

    $scope.printList = function() {
        window.print();
    }

    $scope.clearContactSearch = function(event) {
        $scope.contactSearch = '';
        if($('#list-search').is(":focus")) {
            $('#list-search').focus();
        }
    }

    $scope.contactSearchMouseDown = function(event) {
        event.preventDefault();
    }

    $scope.init = function() {
        $store.bind($scope, 'list', list);
        if(typeof $scope.list !== 'undefined' && $scope.list.length > 0) {
            for(i in $scope.list) {
                if(typeof $scope.list[i].fname === 'undefined') {
                    $scope.list.splice(i,1);
                }
            }
        } else {
            $scope.list = list;
        }
        $scope.isArray = angular.isArray;
        $scope.predicate = 'lname';
        $scope.reverse = false;
        var listener = $scope.$watch("filteredList", function () {
            if(typeof $scope.filteredList !== 'undefined' && $scope.filteredList.length > 0) {
                listener();
                $scope.selectContactByIndex(0);
            };
        });
    }
    $http.get('assets/data/contacts.json').success(function(data) {
       list = data;
       for(i in list) {
         list[i].id = parseInt(i);
       }
       $scope.init();
    });

}]);
