import { guid } from './guid';
import { isUndefined, isDefined } from './is';

/* import { rafFeature } from '@features-detection/features/js/requestAnimationFrame';

// active requestAnimationFrame polyfill if it doesn't exist
rafFeature.isSupported({ usePolyfill: true });
 */

export class SourceEventOption {
    eventName: string;
    options: boolean | AddEventListenerOptions;
}

export class DestinationEventOption {
    eventName: string;
    getDetail?: (event: Event, ...any) => any;
    debug?: string = '';
}

export class EventWrapperParam {
    elementTarget?: EventTarget = window;
    source = new SourceEventOption();
    destination = new DestinationEventOption();
}


export type RemoveListener = () => void;
export type EventSourceName = string;


export type NewEventName = string;
export type EventName = string;
export interface CacheParameter { elementTarget: EventTarget; eventName: string; }
export interface CacheParameterWithEventNameOption { elementTarget: EventTarget; eventName?: string; }

export class ElementTargetCache<T> {
    // every EventTarget = HTMLElement really often, can have few EventName attached = 'scroll', 'resize', ...
    // And every EventName can save a data of type T
    cache = new Map<EventTarget, Map<EventName, T>>();

    constructor() { }

    getFirstOrSecondMapping(param: CacheParameterWithEventNameOption) {
        const { elementTarget, eventName } = param;

        const mapEventNameToData = this.cache.get(elementTarget);

        if (isUndefined(mapEventNameToData) || isUndefined(eventName))
            return mapEventNameToData;

        return mapEventNameToData.get(eventName);
    }

    get(param: CacheParameter): T {
        return this.getFirstOrSecondMapping(param) as T;
    }

    getEventTargetMapping(elementTarget: EventTarget): Map<EventName, T> {
        return this.getFirstOrSecondMapping({ elementTarget }) as Map<EventName, T>;

    }


    set(param: CacheParameter & { data: T }) {
        const { elementTarget, eventName, data } = param;
        let mapEventNameToData = this.cache.get(elementTarget);

        if (isUndefined(mapEventNameToData)) {
            mapEventNameToData = new Map();
            this.cache.set(elementTarget, mapEventNameToData);
        }

        mapEventNameToData.set(eventName, data);
    }

    delete(param: CacheParameterWithEventNameOption) {
        const { elementTarget, eventName } = param;

        if (isUndefined(eventName))
            this.cache.delete(elementTarget);
        else
            this.cache.get(elementTarget).delete(eventName);
    }

    forEach(action: (data: T) => void) {
        this.cache.forEach(newEventToRemover => {
            newEventToRemover.forEach(data => action(data));
        });
    }
}

export type NewEventNameToRemoveListenerMap = Map<NewEventName, RemoveListener>;

export class EventWrapperInRaf {
    private static uniqueId = guid();
    // mapElementTargetToNewEvents
    // mapping event target (often HTMLElement) to source event names ('scroll', 'resize', ...) that maps
    // to all the new custom in rAF event created ('scrollInRaf', 'resizeInRaf') that maps to the removeListener
    // associated to the original source event addListener (target.addListener('scroll') for 'scrollInRaf')
    private removerStore = new ElementTargetCache<NewEventNameToRemoveListenerMap>();
    private targetMapToNewEventMapToSourceEvent = new ElementTargetCache<NewEventName>();

    // new ElementTargetCache<RemoveListener>();
    // private mapElementTargetToNewEventsSet: Map<EventTarget, Set<string>> = new Map();
    // RemoveListener : Map<EventSourceName, RemoveListener> = new Map();
    static _instance: EventWrapperInRaf;

    constructor() { }

    static get instance(): EventWrapperInRaf {

        if (isUndefined(EventWrapperInRaf._instance))
            EventWrapperInRaf._instance = new EventWrapperInRaf();

        return EventWrapperInRaf._instance;
    }

    create(wrapperParameters: EventWrapperParam) {
        const param = Object.assign(new EventWrapperParam(), wrapperParameters);
        const { elementTarget, source } = param;

        if (this.destinationEventNameExists(wrapperParameters))
            throw new Error(`${param.destination.eventName} already exists. It cannot be created twice.`);

        let handlerFactory: (eventParam: EventWrapperParam) => EventListenerOrEventListenerObject;

        if (window.requestAnimationFrame === undefined)
            handlerFactory = this.createHandlerFallback.bind(this);
        else
            handlerFactory = this.createRafHandler.bind(this);

        const { eventName: sourceEventName, options } = source;
        const handler = handlerFactory(param);
        elementTarget.addEventListener(sourceEventName, handler, options);

        const remover = () => elementTarget.removeEventListener(sourceEventName, handler, options);
        this.setRemover(wrapperParameters, remover);
        /*  this.removerStore.set({
             elementTarget,
             eventName: sourceEventName,
             data: () => {
                 elementTarget.removeEventListener(sourceEventName, handler, option);
             }
         }); */
    }

    setRemover(wrapperParameters: EventWrapperParam, remover: RemoveListener) {
        const { elementTarget, source, destination } = wrapperParameters;

        console.assert(isUndefined(this.targetMapToNewEventMapToSourceEvent.get({ elementTarget, eventName: destination.eventName })), `${destination.eventName} already exists`);

        let newEventsMap = this.removerStore.get({ elementTarget, eventName: source.eventName });

        if (isUndefined(newEventsMap)) {
            newEventsMap = new Map();
            this.removerStore.set({
                elementTarget, eventName: source.eventName, data: newEventsMap
            });
        }

        newEventsMap.set(destination.eventName, remover);
        this.targetMapToNewEventMapToSourceEvent.set({ elementTarget, eventName: destination.eventName, data: source.eventName });

    }

    destinationEventNameExists(wrapperParameters: EventWrapperParam) {
        /* const { elementTarget, source, destination } = eventParam;

        const newEventsMap = this.removerStore.get({ elementTarget, eventName: source.eventName });
        if (isUndefined(newEventsMap))
            return false;

        const remover = newEventsMap.get(destination.eventName);
        return isDefined(remover); */
        const { elementTarget, destination } = wrapperParameters;
        const sourceEventName = this.targetMapToNewEventMapToSourceEvent.get({ elementTarget, eventName: destination.eventName });

        return isDefined(sourceEventName);
    }

    removeEventListener(elementTarget: EventTarget, newEventName: string) {
        const sourceEventName = this.targetMapToNewEventMapToSourceEvent.get({ elementTarget, eventName: newEventName });

        const newEventsMap = this.removerStore.get({ elementTarget, eventName: sourceEventName });

        if (isDefined(newEventsMap)) {
            // cannot be undefined because it exists in targetMapToNewEventMapToSourceEvent
            const removeListner = newEventsMap.get(newEventName);
            removeListner();
            this.removerStore.delete({ elementTarget, eventName: sourceEventName });
            this.targetMapToNewEventMapToSourceEvent.delete({ elementTarget, eventName: newEventName });
        }
    }

    removeAllEventListeners() {
        this.removerStore.forEach(newEventsMap => {
            newEventsMap.forEach(remover => remover());
        });
        this.removerStore.cache.clear();
        this.targetMapToNewEventMapToSourceEvent.cache.clear();
    }


    private createRafHandler(wrapperParameters: EventWrapperParam) {
        const { elementTarget, destination: { eventName: newEventName } } = wrapperParameters;

        let running = false;

        const handler = (event: Event) => {
            if (running) { return; }

            running = true;
            requestAnimationFrame(() => {
                // eventParam and event paramters are captured and are the values are the ones when createRafHandler was called
                const detail = this.getDetail(event, wrapperParameters);
                elementTarget.dispatchEvent(new CustomEvent(newEventName, { detail }));

                running = false;
            });
        };

        return handler;
    }

    private createHandlerFallback(wrapperParameters: EventWrapperParam) {
        return (event: Event) => {
            const newEventName = wrapperParameters.destination.eventName;

            const detail = this.getDetail(event, wrapperParameters);
            wrapperParameters.elementTarget.dispatchEvent(new CustomEvent(newEventName, { detail }));
        };
    }


    private getDetail(event: Event, wrapperParameters: EventWrapperParam) {
        const { debug, getDetail } = wrapperParameters.destination;

        const detail = getDetail ? getDetail(event) : {}; // last event is captured
        if (debug !== '')
            detail[ 'debug-' + EventWrapperInRaf.uniqueId ] = debug;


        return detail;
    }
}
