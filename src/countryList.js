const countryCodes = [
    {
      "name": "Argentina",
      "countryCode": "+54",
      "flag": "\ud83c\udde6\ud83c\uddf7"
    },
    {
      "name": "Australia",
      "countryCode": "+61",
      "flag": "\ud83c\udde6\ud83c\uddfa"
    },
    {
      "name": "Austria",
      "countryCode": "+43",
      "flag": "\ud83c\udde6\ud83c\uddf9"
    },
    {
      "name": "Bangladesh",
      "countryCode": "+880",
      "flag": "\ud83c\udde7\ud83c\udde9"
    },
    {
      "name": "Belgium",
      "countryCode": "+32",
      "flag": "\ud83c\udde7\ud83c\uddea"
    },
    {
      "name": "Brazil",
      "countryCode": "+55",
      "flag": "\ud83c\udde7\ud83c\uddf7"
    },
    {
      "name": "Bulgaria",
      "countryCode": "+359",
      "flag": "\ud83c\udde7\ud83c\uddec"
    },
    {
      "name": "Canada",
      "countryCode": "+1",
      "flag": "\ud83c\udde8\ud83c\udde6"
    },
    {
      "name": "China",
      "countryCode": "+86",
      "flag": "\ud83c\udde8\ud83c\uddf3"
    },
    {
      "name": "Croatia",
      "countryCode": "+385",
      "flag": "\ud83c\udded\ud83c\uddf7"
    },
    {
      "name": "Cyprus",
      "countryCode": "+357",
      "flag": "\ud83c\udde8\ud83c\uddfe"
    },
    {
      "name": "Czechia",
      "countryCode": "+420",
      "flag": "\ud83c\udde8\ud83c\uddff"
    },
    {
      "name": "Denmark",
      "countryCode": "+45",
      "flag": "\ud83c\udde9\ud83c\uddf0"
    },
    {
      "name": "Egypt",
      "countryCode": "+20",
      "flag": "\ud83c\uddea\ud83c\uddec"
    },
    {
      "name": "Estonia",
      "countryCode": "+372",
      "flag": "\ud83c\uddea\ud83c\uddea"
    },
    {
      "name": "Finland",
      "countryCode": "+358",
      "flag": "\ud83c\uddeb\ud83c\uddee"
    },
    {
      "name": "France",
      "countryCode": "+33",
      "flag": "\ud83c\uddeb\ud83c\uddf7"
    },
    {
      "name": "Germany",
      "countryCode": "+49",
      "flag": "\ud83c\udde9\ud83c\uddea"
    },
    {
      "name": "Greece",
      "countryCode": "+30",
      "flag": "\ud83c\uddec\ud83c\uddf7"
    },
    {
      "name": "Hong Kong",
      "countryCode": "+852",
      "flag": "\ud83c\udded\ud83c\uddf0"
    },
    {
      "name": "Hungary",
      "countryCode": "+36",
      "flag": "\ud83c\udded\ud83c\uddfa"
    },
    {
      "name": "Iceland",
      "countryCode": "+354",
      "flag": "\ud83c\uddee\ud83c\uddf8"
    },
    {
      "name": "India",
      "countryCode": "+91",
      "flag": "\ud83c\uddee\ud83c\uddf3"
    },
    {
      "name": "Indonesia",
      "countryCode": "+62",
      "flag": "\ud83c\uddee\ud83c\udde9"
    },
    {
      "name": "Ireland",
      "countryCode": "+353",
      "flag": "\ud83c\uddee\ud83c\uddea"
    },
    {
      "name": "Israel",
      "countryCode": "+972",
      "flag": "\ud83c\uddee\ud83c\uddf1"
    },
    {
      "name": "Italy",
      "countryCode": "+39",
      "flag": "\ud83c\uddee\ud83c\uddf9"
    },
    {
      "name": "Japan",
      "countryCode": "+81",
      "flag": "\ud83c\uddef\ud83c\uddf5"
    },
    {
      "name": "Kenya",
      "countryCode": "+254",
      "flag": "\ud83c\uddf0\ud83c\uddea"
    },
    {
      "name": "Korea, Republic of",
      "countryCode": "+82",
      "flag": "\ud83c\uddf0\ud83c\uddf7"
    },
    {
      "name": "Latvia",
      "countryCode": "+371",
      "flag": "\ud83c\uddf1\ud83c\uddfb"
    },
    {
      "name": "Lithuania",
      "countryCode": "+370",
      "flag": "\ud83c\uddf1\ud83c\uddf9"
    },
    {
      "name": "Luxembourg",
      "countryCode": "+352",
      "flag": "\ud83c\uddf1\ud83c\uddfa"
    },
    {
      "name": "Malaysia",
      "countryCode": "+60",
      "flag": "\ud83c\uddf2\ud83c\uddfe"
    },
    {
      "name": "Malta",
      "countryCode": "+356",
      "flag": "\ud83c\uddf2\ud83c\uddf9"
    },
    {
      "name": "Mexico",
      "countryCode": "+52",
      "flag": "\ud83c\uddf2\ud83c\uddfd"
    },
    {
      "name": "Monaco",
      "countryCode": "+377",
      "flag": "\ud83c\uddf2\ud83c\udde8"
    },
    {
      "name": "Netherlands",
      "countryCode": "+31",
      "flag": "\ud83c\uddf3\ud83c\uddf1"
    },
    {
      "name": "New Zealand",
      "countryCode": "+64",
      "flag": "\ud83c\uddf3\ud83c\uddff"
    },
    {
      "name": "Nigeria",
      "countryCode": "+234",
      "flag": "\ud83c\uddf3\ud83c\uddec"
    },
    {
      "name": "Norway",
      "countryCode": "+47",
      "flag": "\ud83c\uddf3\ud83c\uddf4"
    },
    {
      "name": "Pakistan",
      "countryCode": "+92",
      "flag": "\ud83c\uddf5\ud83c\uddf0"
    },
    {
      "name": "Philippines",
      "countryCode": "+63",
      "flag": "\ud83c\uddf5\ud83c\udded"
    },
    {
      "name": "Poland",
      "countryCode": "+48",
      "flag": "\ud83c\uddf5\ud83c\uddf1"
    },
    {
      "name": "Portugal",
      "countryCode": "+351",
      "flag": "\ud83c\uddf5\ud83c\uddf9"
    },
    {
      "name": "Romania",
      "countryCode": "+40",
      "flag": "\ud83c\uddf7\ud83c\uddf4"
    },
    {
      "name": "Russian Federation",
      "countryCode": "+7",
      "flag": "\ud83c\uddf7\ud83c\uddfa"
    },
    {
      "name": "Saudi Arabia",
      "countryCode": "+966",
      "flag": "\ud83c\uddf8\ud83c\udde6"
    },
    {
      "name": "Serbia",
      "countryCode": "+381",
      "flag": "\ud83c\uddf7\ud83c\uddf8"
    },
    {
      "name": "Singapore",
      "countryCode": "+65",
      "flag": "\ud83c\uddf8\ud83c\uddec"
    },
    {
      "name": "Slovakia",
      "countryCode": "+421",
      "flag": "\ud83c\uddf8\ud83c\uddf0"
    },
    {
      "name": "Slovenia",
      "countryCode": "+386",
      "flag": "\ud83c\uddf8\ud83c\uddee"
    },
    {
      "name": "South Africa",
      "countryCode": "+27",
      "flag": "\ud83c\uddff\ud83c\udde6"
    },
    {
      "name": "Spain",
      "countryCode": "+34",
      "flag": "\ud83c\uddea\ud83c\uddf8"
    },
    {
      "name": "Sweden",
      "countryCode": "+46",
      "flag": "\ud83c\uddf8\ud83c\uddea"
    },
    {
      "name": "Switzerland",
      "countryCode": "+41",
      "flag": "\ud83c\udde8\ud83c\udded"
    },
    {
      "name": "Thailand",
      "countryCode": "+66",
      "flag": "\ud83c\uddf9\ud83c\udded"
    },
    {
      "name": "Turkey",
      "countryCode": "+90",
      "flag": "\ud83c\uddf9\ud83c\uddf7"
    },
    {
      "name": "Ukraine",
      "countryCode": "+380",
      "flag": "\ud83c\uddfa\ud83c\udde6"
    },
    {
      "name": "United Arab Emirates",
      "countryCode": "+971",
      "flag": "\ud83c\udde6\ud83c\uddea"
    },
    {
      "name": "United Kingdom",
      "countryCode": "+44",
      "flag": "\ud83c\uddec\ud83c\udde7"
    },
    {
      "name": "United States",
      "countryCode": "+1",
      "flag": "\ud83c\uddfa\ud83c\uddf8"
    },
    {
      "name": "Viet Nam",
      "countryCode": "+84",
      "flag": "\ud83c\uddfb\ud83c\uddf3"
    }
  ];
  
  export default countryCodes;