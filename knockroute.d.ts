    route: {
        AjaxTemplateProvider: (options?: any) => void
        View: (options?: any) => void,
        ViewRouter: (options?: any) => void;
        defaultViewResolver: any
    }
}

    addAreas: (areas: IKnockrouteArea[]) => void;
    addViews: (views: IKnockrouteView[]) => void;
    bus: any,
    navigate(routeValues: any);
}

    name: string,
    views?: IKnockrouteView[]
}

    name: string,
    area?: string,
    model: string | Object | Function,
    templateSrc?: string
}
