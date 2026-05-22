// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.9.6/token/ERC721/ERC721.sol";

contract EventTicketing is ERC721 {
    uint256 private _nextTokenId;
    uint256 public eventCount;

    // --- TÍNH NĂNG MỚI: QUẢN LÝ USER ---
    struct User {
        string name;
        string email;
        bool isRegistered; // Đánh dấu xem ví này đã khai báo thông tin chưa
    }
    // Ánh xạ (Mapping) từ địa chỉ ví -> Thông tin cá nhân
    mapping(address => User) public users;

    // Ánh xạ từ tokenId -> eventId
    mapping(uint256 => uint256) public ticketToEvent;

    struct Event {
        uint256 id;
        string name;
        uint256 price;
        uint256 totalTickets;
        uint256 soldTickets;
        string description;
        string imageUrl;
        string location;
        string eventTime;
    }
    mapping(uint256 => Event) public events;

    constructor() ERC721("EventTicket", "TICKET") {}

    // Hàm Đăng ký thông tin User (Lưu lên Blockchain)
    function registerProfile(string memory _name, string memory _email) public {
        require(
            !users[msg.sender].isRegistered,
            "Tai khoan nay da dang ky roi!"
        );
        users[msg.sender] = User(_name, _email, true);
    }

    function createEvent(
        string memory _name,
        uint256 _price,
        uint256 _totalTickets,
        string memory _description,
        string memory _imageUrl,
        string memory _location,
        string memory _eventTime
    ) public {
        eventCount++;
        events[eventCount] = Event(
            eventCount,
            _name,
            _price,
            _totalTickets,
            0,
            _description,
            _imageUrl,
            _location,
            _eventTime
        );
    }

    function buyTicket(uint256 _eventId) public payable {
        // Yêu cầu User phải khai báo profile trước khi mua vé
        require(
            users[msg.sender].isRegistered,
            "Ban phai dang ky Profile truoc khi mua ve"
        );

        Event storage myEvent = events[_eventId];
        require(
            _eventId > 0 && _eventId <= eventCount,
            "Su kien khong ton tai"
        );
        require(msg.value == myEvent.price, "Khong gui dung so tien");
        require(myEvent.soldTickets < myEvent.totalTickets, "Da het ve");

        myEvent.soldTickets++;
        uint256 tokenId = _nextTokenId++;

        ticketToEvent[tokenId] = _eventId;
        _safeMint(msg.sender, tokenId);
    }
}
