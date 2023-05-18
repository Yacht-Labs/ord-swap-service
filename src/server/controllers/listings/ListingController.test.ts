describe("Listings", () => {
  describe("POST /listings", () => {
    xit("Should be able to create a new listing", async () => {});

    xit("Should not create a new listing if the pkp generation fails", async () => {});

    xit("Should respond with a 500 error if the pkp generation fails", async () => {});

    xit("Should create a new listing if the pkp generation succeeds", async () => {});

    xit("Should respond with a 200 if the pkp generation succeeds", async () => {});

    xit("Status on returned listing should not be ready", async () => {});
  });

  describe("GET /listings/confirm", () => {
    it("Should confirm a listing based on READY response from Listing Service", () => {
      // confirm in the database
    });

    // it should update based on the other 3 possibilities of responses from the listing service;
  });

  describe("GET /listings/buy", () => {
    it("Should set a listing to SOLD if proper response from ETH Listing Service", async () => {});

    it("Should keep listing ready if no winner in inscription sale", async () => {});
  });
});
