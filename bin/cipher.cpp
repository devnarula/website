#include <bits/stdc++.h>
using namespace std;

void encrypt(const string& text, string key, const string& method) {
    if (method == "caesar") {
        for (char c : text) {
            if (isalpha(c)) {
                int ikey = stoi(key);
                char base = isupper(c) ? 'A' : 'a';
                char enc = (c - base + ikey) % 26;
                if (enc < 0) enc += 26;
                cout << (char)(enc + base);
            } else {
                cout << c;
            }
        }
        return;
    }
    if (method == "vigenere") {
        int ln = key.length();
        int n = text.length();
        for (int i = 0; i<n; i++) {
            int x = ((text[i] - 'A') + (key[i%ln] - 'A'))%26;
            if (x < 0) x += 26;
            cout<<(char)(x + 'A');
        }
        return;
    }
    map<char,char> mp;
    for (int i = 0; i<26; i++) {
        mp[i + 'A'] = key[i]; 
    }
    if (mp.size() != 26 || key.length() != 26) {
        cerr<<"bad substitution key (must be a permutation of A-Z)\n";
        exit(-1);
    }

    for (auto c: text) {
        cout<<mp[c];
    }
}

void decrypt(const string& text, const string& method, string key = "") {
    if (method == "caesar") {
        return;
    }
    if (method == "vigenere") {
        return;
    }
    if (method == "substitution") {
        return;
    }
}

string cleantext(const string& s) {
    string res = "";
    for (auto c: s) {
        if (c >= 'A' and c <= 'Z') res += c;
        else if (c >= 'a' and c <= 'z') res += c;
    }
    return res;
} 

int main(int argc, char* argv[]) {
    unordered_map<string, string> args;

    for (int i = 1; i + 1 < argc; i += 2) {
        args[argv[i]] = argv[i + 1];
    }

    string op = args["--operation"];
    string cipher = args["--cipher"];
    string text = args["--text"];
    string keyStr = args.count("--key") ? args["--key"] : "0";

    text = cleantext(text);

    if (op == "encrypt") {
        if (cipher == "caesar") {
            encrypt(text, keyStr, "caesar");
        } 
        else if (cipher == "vigenere") {
            encrypt(text, keyStr, "vigenere");
        }
        else if (cipher == "substitution") {
            encrypt(text, keyStr, "substitution");
        }
        else {
            cerr << "Unknown cipher type\n";
            return 1;
        }
    } else if (op == "decrypt") {
        if (cipher == "caesar") {
            // encryptCaesar(text, -key);
        } else {
            cerr << "Unknown cipher type\n";
            return 1;
        }
    } else {
        cerr << "Unknown operation\n";
        return 1;
    }

    return 0;
}
