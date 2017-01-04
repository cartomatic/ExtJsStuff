describe('setup test for extjs', function () {

    it("has ExtJs defined", function(){
        expect(Ext).toBeDefined();
    });

    it("Ext major is 6", function(){
       expect(Ext.getVersion().major).toBe(6);
    });

    it("Ext full version of 6.0.1.250", function(){
        expect(Ext.getVersion().version).toBe('6.0.1.250');
    });

    it("Ext minor version of 0", function(){
        expect(Ext.getVersion().minor).toBe(0);
    });

    it("test a controllers method returns undefined", function(){
        var ctrl = Ext.create('WallabyJs.view.main.MainController');
        expect(ctrl.testMethod()).toBe(undefined);
    });

    it("test a controllers method with number", function(){
        var ctrl = Ext.create('WallabyJs.view.main.MainController');
        expect(ctrl.testMethod(44)).toBe(44);
    });

    it("should add two numbers properly", function(){
        var ctrl = Ext.create('WallabyJs.view.main.MainController');
        expect(ctrl.anotherMethodUnderTest(3,3)).toBe(6);
    });

    it("should be able to create a view", function(){
       var view = Ext.create('WallabyJs.view.main.Main');
        expect(view instanceof WallabyJs.view.main.Main).toBe(true);
    });

});