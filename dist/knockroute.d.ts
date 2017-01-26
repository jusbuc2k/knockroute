interface KnockoutStatic {
    route: {
        AjaxTemplateProvider: (options?: any) => void
        View: (options?: any) => void,
        ViewRouter: (options?: any) => void;
        defaultViewResolver: any
    }
}

interface IKnockrouteViewRouter {
    addAreas: (areas: IKnockrouteArea[]) => void;
    addViews: (views: IKnockrouteView[]) => void;
    bus: any,
    navigate(routeValues: any);
}

interface IKnockrouteArea {
    name: string,
    views?: IKnockrouteView[]
}

interface IKnockrouteView {
    name: string,
    area?: string,
    model: string | Object | Function,
    templateSrc?: string
}