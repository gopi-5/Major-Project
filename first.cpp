#include<iostream>
#include<vector>
#include<algorithm>
using namespace std;

int main(){
vector<int> arr={3,2,1};
next_permutation(arr.begin(),arr.end());
 for(int x : arr) {
        cout << x << " ";
    }
return 0;

}